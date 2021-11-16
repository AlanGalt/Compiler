const compileButton = document.getElementById("compile-button");
const code = document.getElementById("code-input");
const lexemes = document.getElementById("lexemes");
const identifiers = document.getElementById("identifiers");
const tree = document.getElementById("tree");
const assembly = document.getElementById("assembly");
const errors = document.getElementById("errors");

const compiler = new Compiler();
compileButton.onclick = () => {
  lexemes.value = '';
  identifiers.value = '';
  tree.value = '';
  assembly.value = '';
  errors.value = '';

  compiler.compile(code.value);
  if (compiler.error) return;
  
  for (let l of compiler.lexemes) {
    lexemes.value += l;
  }

 

  compiler.ids.forEach((value, key) => {
    let id_str = `${key} : ${value}\n`
    identifiers.value += id_str;
  });

  tree.value += compiler.tree;
  
  for (line of compiler.assembly) {
    assembly.value += line + '\n';
  }
}

function initId(idList, type, lineNo) {
  const ids = compiler.ids;
  init = (id) => {
    if (!ids.has(id)) {
      ids.set(id, type);
    } else {
      compiler.error = true;
      let error = `Semantic error at line ${lineNo + 1}:\nVariable with name "${id}" has already been declared.`
      errors.value += error + '\n';
      console.error(error);
    }
  }
  if (Array.isArray(idList)) {
    for (id of idList) {
      init(id);
    }
  } else {
    init(idList);
  } 
}

function setId(id, value, lineNo) {
  const ids = compiler.ids;
  const idType = ids.get(id);

  typingCollision = () => {
    compiler.error = true;
    let error = `Semantic error at line ${lineNo + 1}:\n`
    +`Type collision while assinging to ${idType}-typed variable.`;
    errors.value += error + '\n';
    console.error(error);
  }

  if (ids.has(id)) {
    if (value === Object(value)) { // if value is object
      if ((idType === 'int' && value.type.split('_')[0] === 'bool')
      || (idType === 'bool' && value.type.split('_')[0] === 'int')) {
         // type mismatch
        typingCollision();
      } else {
        // assign the variable here
      }
    } else { // value is not an object
      if ((idType === 'bool' && value != 'true' && value != 'false')
      || (idType === 'int' && !Number.isInteger(parseInt(value)))) {
        // type mismatch
        typingCollision();
      } else {
        // assign the variable here
      }
    }
  } else { // no such id
    compiler.error = true;
    let error = `Semantic error at line ${lineNo + 1}:\n`
    +`Assigning to an undeclared variable "${id}".`
    errors.value += error + '\n';
    console.error(error);
  }
}


concatList = (list, add) => Array.isArray(list) ? [...list, add] : [list, add];



code.onkeydown = (e) => {
  let TABKEY = 9;
  if(e.keyCode == TABKEY) {
      insertAtCursor(code, '    ');
      e.preventDefault();
      return false;
  }
}


function insertAtCursor(myField, myValue) {
  if (myField.selectionStart || myField.selectionStart == '0') {
    var startPos = myField.selectionStart;
    var endPos = myField.selectionEnd;
    myField.value = myField.value.substring(0, startPos)
      + myValue
      + myField.value.substring(endPos, myField.value.length);
    myField.selectionStart = startPos + myValue.length;
    myField.selectionEnd = startPos + myValue.length;
  } else {
    myField.value += myValue;
  }
}

