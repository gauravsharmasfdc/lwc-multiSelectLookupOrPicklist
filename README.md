# lwc-multiSelectLookupOrPicklist
This is reusable lwc component for multi-select lookup or picklist



/**
 # HOW TO USE THIS COMPONENT
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
