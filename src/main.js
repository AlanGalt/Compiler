const compileButton = document.getElementById("compile-button");
const code = document.getElementById("code-input");
const lexemes = document.getElementById("lexemes");
const identifiers = document.getElementById("identifiers");

const compiler = new Compiler();
compileButton.onclick = () => {
  lexemes.value = '';
  identifiers.value = '';
  compiler.compile(code.value);
  compiler.ids.forEach((value, key) => {
    let id_str = `${key} : ${value.type} : ${value.value}\n`
    identifiers.value += id_str;
  });
}

function initId(idList, type, lineNo) {
  const ids = compiler.ids;
  init = (id) => {
    if (!ids.has(id)) {
      ids.set(id, {value: null, type: type});
    } else {
      console.error(`Semantic error at line ${lineNo + 1}:\nVariable with name "${id}" has already been declared.`);
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
  const idType = ids.get(id)?.type;
  typingCollision = () => {
    console.error(`Semantic error at line ${lineNo + 1}:\n`
    +`Typing collision while assinging to ${idType}-typed variable.`);
  }

  if (ids.has(id)) {
    if (value === Object(value)) { // if value is object
      if ((idType === 'int' && value.type[0].split('_') === 'bool')
      || (idType === 'bool' && value.type[0].split('_') === 'int')) {
         // type mismatch
        typingCollision();
      } else {
        // assign the variable here
      }
    } else { // value is not an object
      if ((idType === 'bool' && value != 'true' && value != 'false')
      || (idType === 'int' && !Number.isInteger(parseInt(value)))) {
        console.log(value, idType);// type mismatch
        typingCollision();
      } else {
        // assign the variable here
      }
    }
  } else { // no such id
    console.error(`Semantic error at line ${lineNo + 1}:\n`
    +`Assigning to an undeclared variable "${id}".`);
  }
}


concatList = (list, add) => [...list, add];

