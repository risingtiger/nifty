

import { str } from "../defs.js"




function CSV_Download(csvstr:string, filename:string) {

    const blob = new Blob([csvstr], { type: 'text/csv' }); 
  
    const url = window.URL.createObjectURL(blob) 
  
    const a = document.createElement('a') 
  
    a.setAttribute('href', url) 
  
    a.setAttribute('download', `${filename}.csv`); 
  
    a.click()
}

/**
 * Resolves object references in a list by replacing properties with __path
 * with the actual referenced objects from other object stores.
 * 
 * @param list - The list of objects to process
 * @param objectStores - Map of object store names to their data arrays
 */
function resolveObjectReferences(
    list: {[key: str]: any}[], 
    objectStores: Map<string, {[key: str]: any}[]>
): void {
    // Create lookup maps for each object store for O(1) access by ID
    const lookupMaps = new Map<string, Map<string, any>>();
    
    // Initialize lookup maps only for stores that are needed
    // We'll populate them on-demand when first encountered
    
    // Process each object in the list
    for (const item of list) {
        // Check each property of the object
        for (const key in item) {
            const value = item[key];
            
            // Skip if not an object or doesn't have __path
            if (!value || typeof value !== 'object' || !value.__path) {
                continue;
            }
            
            const [storeName, itemId] = value.__path;
            
            // Get or create the lookup map for this store
            let lookupMap = lookupMaps.get(storeName);
            if (!lookupMap) {
                const storeData = objectStores.get(storeName);
                if (!storeData) {
                    continue; // Skip if store doesn't exist
                }
                
                // Create lookup map for this store
                lookupMap = new Map();
                for (const storeItem of storeData) {
                    if (storeItem.id) {
                        lookupMap.set(storeItem.id, storeItem);
                    }
                }
                lookupMaps.set(storeName, lookupMap);
            }
            
            // Replace reference with actual object
            const referencedObject = lookupMap.get(itemId);
            if (referencedObject) {
                item[key] = referencedObject;
            }
        }
    }
}




if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).Utils = { CSV_Download, resolveObjectReferences };
