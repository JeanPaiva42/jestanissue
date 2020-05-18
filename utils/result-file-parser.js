const fs = require('fs');

function parseResultFile(file, folderPath){

	let rawData = fs.readFileSync(file);
	let jsonData = JSON.parse(rawData);
	let newResultReport = []

	if(!('0' in jsonData['testResults']))
	{
		throw new Error("No tests were ran, verify your suite please")
	}

	//lol call me old-fashioned but I'm not big on forEach lol


		jsonData['testResults'].forEach((data) => {
			if (data['status'] !== 'passed') {
				newResultReport.push(data)
			}
		})



	writeNewResultFile(newResultReport, folderPath+'/issues-results.json');

	return newResultReport;
}


function writeNewResultFile(resultData, filePath){
    fs.writeFileSync(filePath, (JSON.stringify(resultData)));
}




module.exports = parseResultFile;
