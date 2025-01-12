// copyUdfValues.js

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJteHBkb2UwbDF4eTVnZDU5dHp5ZCIsIm14LXdzaWQiOiJDMDdEMzI5Qi1GODJDLTQ3Q0UtOUU1QS1DMDRCMkUzRjNCNTciLCJleHAiOjE3NTIwMTkyMDB9.UDzP73kPNEU8Q62itDox9zfeJdZA0bAerb1RbjkBK_o";
const connectHeaders = { "Content-type": "application/json; charset=UTF-8", "Authorization": `Bearer ${token}` };
const baseurl = "https://api.maximizer.com/octopus";

async function updateUdf(connectHeaders, baseurl, abKey, udfTypeId, udfValue) {
    let method = "Update";
    let endpoint = `${baseurl}/${method}`;
    let udfKey = "Udf/$TYPEID(" + udfTypeId + ")";
    let request = {
        "AbEntry": {
            "Data": {
                "Key": abKey,
                [udfKey]: udfValue
            }
        }
    };

    let connectOptions = { method: "POST", body: JSON.stringify(request), headers: connectHeaders };
    let maReq = {
		reqType: endpoint,
		connectMeta: connectOptions
	};

    try {
        const response = await fetch(maReq.reqType, maReq.connectMeta);
        const pkg = await response.json();
        if (pkg.Code >= 0) {
			console.log("Result: " + udfKey + "--" + pkg.AbEntry.Data.Key + " - " + pkg.AbEntry.Data.udfKey);
        } else {
            console.log("<updateUdf> MaxAPI Code " + pkg.Code + ": " + pkg.Msg[0].Message);
        }
    } catch (error) {
        console.log("<updateUdf> ERROR! (fetch/response): " + error);
    }
}

async function getTopLevelUdfValue(connectHeaders, baseurl, abId, udfTypeId) {
	let method = "Read";
	let endpoint = `${baseurl}/${method}`;
	let udfKey = "Udf/$TYPEID(" + udfTypeId + ")";
	let request ={
		"AbEntry": {
			"Scope": {
				"Fields": {
					"Key": 1,
					"Type": 1,
					"CompanyName": 1,
					"LastName": 1,
					"FirstName": 1,
					[udfKey]: 1
				}
			},
			"Criteria": {
				"SearchQuery": {
					"$AND": [
						{
							"Key": {
								"$EQ" : {
									"Id": abId
								}
							}
						},
						{
							"Type": {
								"$NE": "Contact"
							}
						}
					]
				}
			}
		},
		"Configuration": {
			"Drivers": {
				"IAbEntrySearcher": "Maximizer.Model.Access.Sql.AbEntrySearcher"
			}
		},
		"Compatibility": {
			"AbEntryKey": "2.0"
		}
	};

	let connectOptions = { method: "POST", body: JSON.stringify(request), headers: connectHeaders };
	let maReq = {
		reqType: endpoint,
		connectMeta: connectOptions
	};

	try {
		const response = await fetch(maReq.reqType, maReq.connectMeta);
		const pkg = await response.json();
		if (pkg.code >= 0) {
			if (pkg.AbEntry.Data.length >= 1) {

			} else {
				console.log("<getTopLevelUdfValue> Result Set Empty! UDF Type ID invalid or Address Book ID not exist.");
			}
		}
	} catch (error) {

	}
}