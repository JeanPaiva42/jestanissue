#!/usr/bin/env node
'use strict';
const fs = require('fs');
const readline = require('readline');
const createIssue = require( './../lib' );
const exec = require('child_process').spawnSync
const jestFileParser = require('../utils/result-file-parser');
const tokenDataFile =__dirname+'/data.json';

//in case of being true, the command will only run tests, without creating any issue
var debug = false



async function main() {

	var myArgs = process.argv.slice(2);

	if(myArgs.includes('--reset')){
		return delDataFile();
	}

	if(myArgs.includes('--debug')){
		debug = true
	}

	myArgs = myArgs !== undefined ? ((myArgs.join()).split(",").join(" ")) : "";

	console.log("Running JEST tests...")

	let jestFilePath = __dirname+'/'+'test-results-jest.json';
	let jestOutput = await exec('jest', [myArgs, '--json', '--outputFile='+jestFilePath]);

	if(debug){
		return console.log(jestOutput.stderr.toString())
	}

	console.log(jestOutput.stderr.toString())
	try{
		await jestFileParser(jestFilePath, __dirname)
	}
	catch (e) {
		console.log(e)
		return "Couldn't run test properly";
	}

	let jsonData = undefined;
	try {
		let rawData = fs.readFileSync(tokenDataFile);
		jsonData = JSON.parse(rawData);
	}
	catch (e) {
		console.log('Lets insert your repository data');
		jsonData = await getUserData();
	}

	if(jsonData !== undefined){
		await createIssues(jsonData);
	}
	else{
		throw new Error("Can't complete issue creation")
	}

}



function clbk( error, issue, info ) {
	if ( info ) {
		//console.error( info );
	}
	if ( error ) {
		throw new Error( "Failed to created issue\n"+error.message );
	}
	console.log( "Issue created successfully");
}


async function getUserData(){
	var reader = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	let authToken = ""
	let repository = ""

	const question1 = () => {
		return new Promise((resolve, reject) => {
			reader.question("Insert github auth_token:", (answer) => {
				resolve(answer)
			})
		})
	}

	const question2 = () => {
		return new Promise((resolve, reject) => {
			reader.question("Insert repository name (e.g owner/repo-name):", (answer) => {
				resolve(answer)
			})
		})
	}

	authToken = await question1();
	repository = await question2();

	if (!(authToken !== "" && repository.includes('/'))) {
		throw new Error("Invalid input, check token and/or repository");
	}

	let dataObj = {token: authToken.trim(), repo: repository.trim()}
	fs.writeFileSync(tokenDataFile, (JSON.stringify(dataObj)));
	console.log("Repository data written.\n")
	return dataObj;
}




async function createIssues(dataObj)
	{

		let stdout =  await exec('git', ['branch', '-v']);
		stdout = getCorrectBranch(stdout);

		dataObj['title'] = getBranchVersion(stdout);
		dataObj['repo_data'] = stdout;


		if(dataObj === undefined || !(dataObj.hasOwnProperty('token') && dataObj.hasOwnProperty('repo'))){
			throw new Error("Invalid credentials object");
		}

		let testResultData = undefined
		try{
			testResultData = fs.readFileSync(__dirname+'/issues-results.json');

			if (testResultData !== undefined && testResultData !== "") {
				testResultData = JSON.parse(testResultData)
			}
		}
		catch (e) {
			throw new Error("Invalid report data file or file couldn't be retrieved")
		}




		var reader = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		dataObj['body'] = `<h3><strong>Test cases that failed: </strong></h3>`






		for(var i = 0; i < testResultData.length; i++) {
			dataObj['body'] += `\n \n<h5>${removeUnicode(testResultData[i]['message'])}</h5>`
		}

		const question3 = () => {
			return new Promise((resolve, reject) => {
				reader.question("Insert body message:", (answer) => {
					resolve(answer)
				})
			})
		}

		let issueTitle = `Jest test results - ${dataObj['repo_data']}`


		let body = await question3();
		reader.close()

		dataObj['body'] += `\n\n<h3><strong>Tester message: ${body}</strong></h3>`
		dataObj['body'] += `\n\n Branch and hash: <i>`+dataObj['repo_data']+`</i>`
		dataObj['labels'] = ["bug"]

		delete dataObj['repo_data'];

		await createIssue(dataObj['repo'], issueTitle, dataObj, clbk);
	}



function getBranchVersion(str){
	str = str.replace(/ +(?= )/g,'')
	let newStringList = str.split(" ")
	return newStringList[0]+"-"+newStringList[1];

}
function delDataFile(){
fs.stat(tokenDataFile, function (err, stats) {
	//console.log(stats);//here we got all information of file in stats variable

	if (err) {
		return console.error("Nothing to reset");
	}

	fs.unlink(tokenDataFile,function(err){
		if(err)
			return console.log(err);
		console.log('data file reset successfully');
	});
});
}

module.exports =  main();
//let stdout =  exec('git', ['branch', '-v']);
//console.log(stdout.stdout.toString());
//console.log((getCorrectBranch(stdout)));

function getCorrectBranch(result){
	if(result.stdout.toString()){
		let branchList = result.stdout.toString().split('\n')
		let currentBranch = getCurrentBranch(branchList);
		return currentBranch
	}
	else{
		return "No branch available"
	}

}

function getCurrentBranch(branchList) {
	for(var i=0;i<branchList.length;i++){
		if(branchList[i].startsWith('*'))
			return branchList[i].substring(1).trim()
		else
			return "No branch selected"
	}

}

function removeUnicode(str){
	return str.replace(/[^\x00-\x7F]/g, "").trim()
}
