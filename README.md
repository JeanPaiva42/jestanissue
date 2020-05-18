# JEST AN ISSUE
JEST + GITHUB ISSUES

This package runs Jest tests, get the fails and post them as issues in the given repository.


This package borrows code for issues creation from the github-create-issue (https://github.com/kgryte/github-create-issue#readme).

 
# Installation
 
 You can install the package with:
 <br>
 <br>
 `npm install --save-dev jestanissue`
 
  
#Usage
 
 When you run the command for the first time the program will ask you for a token, with enough authorization to create issues in a repo.
 <br>
 <br>
 Also, the package will ask for the repository name (repo/repo-name) 
 <br>
 <br>
 To use it, you first need to use:
 <br>
 `export PATH="$PATH:node_modules/.bin"`
 <br><br>
 And then:
 <br>
 <br>
 `jestanissue` <br>
(this will make it run every jest test you have in the repository, just like jest would)
  <br>
  <br>
 You can also specific tests like <br>
 <br>
 `jestanissue test-login`
 
 To run tests without creating new issues you can run:
 <br>
 <br>
  `jestanissue --debug`
 
 
 To reset you repo info you can run (this will delete your token from the local machine, so be sure you saved it somewhere else):
  <br>
  <br>
   `jestanissue --reset`



I hope this turns out to be useful to somebody!
