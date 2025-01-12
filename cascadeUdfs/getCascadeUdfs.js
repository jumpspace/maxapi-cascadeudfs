// getCascadeUdfs.js
// Copy values from top-level records their respective contacts.
let udfKeyList = [];

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJteHBkb2UwbDF4eTVnZDU5dHp5ZCIsIm14LXdzaWQiOiJDMDdEMzI5Qi1GODJDLTQ3Q0UtOUU1QS1DMDRCMkUzRjNCNTciLCJleHAiOjE3NTIwMTkyMDB9.UDzP73kPNEU8Q62itDox9zfeJdZA0bAerb1RbjkBK_o";
const connectHeaders = { "Content-type": "application/json; charset=UTF-8", "Authorization": `Bearer ${token}` };
const baseurl = "https://api.maximizer.com/octopus";

const isContact = (rtContact) => rtContact == "Contact";
const isTopLevel = (rtTopLevel) => (rtTopLevel == "Company" || rtTopLevel == "Individual");

async function getUdfList(connectHeaders, baseurl, udfKeyList) {
    let method = "Read";
	let endpoint = `${baseurl}/${method}`;
    let request = {
        "Schema": {
            "Scope": {
                "Fields": {
                    "Key": 1,
                    "Alias": 1,
                    "Type": 1,
                    "Name": 1,
                    "AppliesTo": 1,
                    "Sortable": 1,
                    "Nullable": 1,
                    "Assignable": 1,
                    "Queryable": 1,
                    "Mandatory": 1,
                    "Attributes": 1,
                    "HasOption": 1,
                    "DisplayValue": 1
                }
            },
            "Criteria": {
                "SearchQuery": {
                    "Key": {
                        "$TREE": "/AbEntry"
                    }
                }
            }
        },
        "Compatibility": {
            "SchemaObject": "1.0"
        }
    };
    
    let connectOptions = { method: "POST", body: JSON.stringify(request), headers: connectHeaders };
    let maReq = {
		reqType: endpoint,
		connectMeta: connectOptions
	};

    let strKey = "";
    let fieldList = [];
    let udfSearchTerm = "$TYPEID(";  // Identify which field is a UDF

    try {
        const response = await fetch(maReq.reqType, maReq.connectMeta);
		const pkg = await response.json();
        if (pkg.Code >= 0) {
            fieldList = pkg.Schema.Data;
            if (fieldList.length >= 1) {
                for (let count = 0; count < fieldList.length; count++) {
                    strKey = fieldList[count].Key;
                    if (strKey.includes(udfSearchTerm)) {
                        udfKeyList.unshift({ "Key": fieldList[count].Key, "Name": fieldList[count].Name, "Alias": fieldList[count].Alias,
                            "Type": fieldList[count].Type, "AppliesTo": fieldList[count].AppliesTo });
                    }
                }
                return udfKeyList;
            } else {
                console.log("<getUdfList> Result Set Empty! Malformed query or corrupted database.");
            }
        } else {
            console.log("<getUdfList> MaxAPI Code " + pkg.Code + ": " + pkg.Msg[0].Message);
        }
    } catch (error) {
        console.log("<getUdfList> ERROR! (fetch/response): " + error);
    }
}

console.log("Retrieving Top-Level, Contact UDFs . . .");

getUdfList(connectHeaders, baseurl, udfKeyList).then((keyList) => {
    let cascadeList = [];

    for (let count = 0; count < keyList.length; count++) {
        if (keyList[count].AppliesTo.findIndex(isContact) > -1 && keyList[count].AppliesTo.findIndex(isTopLevel) > -1) {
            cascadeList.unshift({ "Key": keyList[count].Key, "Name": keyList[count].Name, "Alias": keyList[count].Alias,
                "Type": keyList[count].Type, "AppliesTo": keyList[count].AppliesTo });
        }
    }

    return new Promise((resolve, reject) => {
        if (cascadeList.length < 1) { 
            reject("<getCascadeUdfs> UDF List Empty!"); 
        }

        resolve(cascadeList);
    });

}).then((cascadeList) => console.log(cascadeList))
.catch((error) => console.log(error));