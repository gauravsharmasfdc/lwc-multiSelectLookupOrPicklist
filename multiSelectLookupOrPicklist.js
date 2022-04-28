**
 * HOW TO USE THIS COMPONENT
 * Use Case 1: Multi Select Picklist , value drived from Any Object's picklist field.
 *      Requiered Parameter:
 *          *   SObject Api Name, like Account
 *          *   showFieldApiName : Picklist Field Api name, Picklist field value that will use as picklist values on UI
 * Use Case 2: Muilti Select lookup Field , Value drived from Any Object records
 *      Requiered Parameter:
 *          *   lookup  :  Pass this property
 *          *   objectApiName : SObject Api Name, like Account
 *          *   searchFieldApiName :    Fields Api name (comma separated), to filer records, like Name,City.
 *                                      This will find recods wehre name or city match with search string
 *          *   showFieldApiName : Field Api name, field value that will use to show as list values
 */

import { LightningElement, api, track } from 'lwc';
import fatchRecords from '@salesforce/apex/multiSelectLookupOrPicklistController.fatchRecords';
import getPicklistValuesData from '@salesforce/apex/multiSelectLookupOrPicklistController.getPicklistValues';
export default class MultiSelectLookupOrPicklist extends LightningElement {
    @api label;
    @api hideLabel = false; //  True, To show field label
    @api lookup = false; // True , if wants to show input field to perform search on exiting record from salesforce
    @api objectApiName;
    @api searchFieldApiName; // Can Pass comma(,) separated values , if lookup perform search functionality on multiple fields.
    @api showFieldApiName; // Accept Only one field api name, this field used to show record on UI

    @track listItems = [];
    @track selectedItems = [];

    searchTerm = '';
    isOpenView = false;
    timeoutID;
    noDataFound = false;

    @api removeSelectedItems() {
        this.selectedItems = [];
        this.clearAllSelectedFlag();
    }

    connectedCallback() {
        console.log('multiSelectLookupOrPicklist Loaded');

        // To get picklist value
        if (!this.listItems.length && !this.lookup) {
            getPicklistValuesData({
                objectApiName: this.objectApiName,
                fieldName: this.showFieldApiName,
                selectedPicklistValues: JSON.stringify(
                    this.selectedItems.map((item) => item.id)
                )
            })
                .then((result) => {
                    this.listItems = JSON.parse(JSON.stringify(result));
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    }

    get applicableClasses() {
        return this.isOpenView
            ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open slds-has-focus'
            : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    }

    get isAreaExpended() {
        return this.isOpenView ? 'true' : 'false';
    }

    get selectedItemsForPill() {
        return this.selectedItems.map((item) => ({
            label: item.value,
            name: item.id
        }));
    }

    get isItemLoading() {
        return this.listItems.length ? false : this.noDataFound ? false : true;
    }

    get placeholder() {
        return this.selectedItems.length
            ? `${this.selectedItems.length} Options Selected`
            : 'Select an Option...';
    }

    handleButtonClick() {
        if (this.lookup) {
            if (this.searchTerm) {
                this.startSearch();
                this.template.querySelector('[data-id="container"]').focus();
            }
        } else {
            this.template.querySelector('[data-id="container"]').focus();
            this.isOpenView = true;
        }
    }

    handleInputChange(event) {
        if (event.keyCode === 13) {
            if (this.searchTerm) {
                this.startSearch();
                this.template.querySelector('[data-id="container"]').focus();
            }
        } else {
            this.searchTerm = event.target.value;
            this.searchTerm.trim();
        }
    }

    onLeave(event) {
        this.isOpenView = false;
        this.searchTerm = '';
    }

    handleItemSelection(event) {
        let selectedItemId = event.currentTarget.dataset.id;
        let selectedItemValue = event.currentTarget.dataset.value;

        // Adding item to selected items list
        let itemIndex = this.findExistingItemIndex(selectedItemId);
        if (itemIndex < 0) {
            this.selectedItems.push({
                id: selectedItemId,
                value: selectedItemValue
            });
        } else {
            this.selectedItems.splice(itemIndex, 1);
        }

        // Updating selected flag for selected item
        this.updateSelectedFlag(selectedItemId);

        this.dispatchEvent(
            new CustomEvent('change', {
                detail: JSON.stringify(this.selectedItems)
            })
        );
    }

    handleItemRemove(event) {
        let removedItemId = event.detail.item.name;
        let removedItemIndex = this.findExistingItemIndex(removedItemId);
        this.selectedItems.splice(removedItemIndex, 1);
        // Updating selected flag for selected item
        this.updateSelectedFlag(removedItemId);
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: JSON.stringify(this.selectedItems)
            })
        );
    }

    // Helper Methods

    findExistingItemIndex(itemId) {
        let itemIndex = -1;
        this.selectedItems.forEach((item, index) => {
            if (item.id === itemId) {
                itemIndex = index;
            }
        });
        return itemIndex;
    }

    startSearch() {
        // Setting focus on main div if , somehow user loose focus and still typing
        //this.template.querySelector('[data-id="container"]').focus();
        this.isOpenView = true;
        this.listItems = [];
        this.noDataFound = false;

        this.fatchRecords(this.searchTerm);
    }

    fatchRecords(searchTerm) {
        fatchRecords({
            sObjectApiName: this.objectApiName,
            searchFields: this.searchFieldApiName,
            queryField: this.showFieldApiName,
            searchTerm: searchTerm,
            selectedRecords: JSON.stringify(
                this.selectedItems.map((item) => item.id)
            )
        })
            .then((result) => {
                this.listItems = JSON.parse(JSON.stringify(result));
                if (result.length) {
                    this.noDataFound = false;
                } else {
                    this.noDataFound = true;
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }

    updateSelectedFlag(itemId) {
        // Updating selected flag for selected item
        this.listItems.forEach((item) => {
            if (item.id === itemId && !item.selected) {
                item.selected = true;
            } else if (item.id === itemId && item.selected) {
                item.selected = false;
            }
        });
    }

    clearAllSelectedFlag() {
        this.listItems.forEach((item) => {
            item.selected = false;
        });
    }
}
