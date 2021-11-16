class Compiler {
  constructor() {
    this.parser = parser;
    this.error = false;
  }

  compile(code) {
    this.tree = '';
    this.ids = new Map();
    this.tCount = 0;
    this.fCount = 0;
    this.lCount = 0;
    this.error = false;
    this.assembly = [];
    this.lexemes = '';

    const lexer = this.parser.lexer;
    lexer.setInput(code);
    while (!lexer.done) {
        let token = lexer.lex();
        if (token in parser.terminals_) {
          token = parser.terminals_[token];
        }
        
        let lexeme = `${token}`
        for (let i = 0; i < 13 - token.length; i++) {
          lexeme += ' ';
        }    
        lexeme += `"${lexer.yytext}"\n`;
        this.lexemes += lexeme;
    }
    const parsedObj = this.parser.parse(code);
    if (this.error) return;
    this.tree = JSON.stringify(parsedObj.value[1].value, null, 2);
    for (let operator of parsedObj.value[1].value) {
      this.generateCode(operator, 0);
    }
  }

  generateCode(tree, regNum) {
    let t = tree.type;
    if (t === 'block') {
      for (let op of tree.value) {
        this.generateCode(op, regNum);
      }
    } else {
      this[`generate${t[0].toUpperCase()}${t.slice(1)}`](tree.value, regNum);
    }
  }

  generateAssign(value, regNum, destR) {
    let dest = destR ? destR : value[0];
    if (value[1] === Object(value[1])) {
      switch(value[1].type.split('_')[0]) {
        case 'int':
          this.generateIntOp(value[1], regNum);
          break;
        case 'bool':
          this.generateBoolOp(value[1], regNum);
          break;
      }
      this.assembly.push(`MOV ${dest}, R${regNum}`); 
    } else {
      let res;
      if (Number.isInteger(parseInt(value[1]))) {
        res = value[1];
      } else {
        res = +JSON.parse(value[1]) ? -1 : 0;;
      }
      this.assembly.push(`MOV ${dest}, ${res}`);
    }
  }

  generateIntOp(tree, reg1, reg2 = reg1 + 1) {
    if (tree === Object(tree)) {
      let left = tree.value[0];
      let right = tree.value[1];
      this.generateIntOp(left,  reg1);
      this.generateIntOp(right, reg1 + 1);
      let opCode = tree.type.split('_')[1].toUpperCase();
      this.assembly.push(`${opCode} R${reg1}, R${reg2}`);
    } else {
      this.assembly.push(`MOV R${reg1}, ${tree}`);
    }
  }

  generateBoolOp(tree, reg1, reg2 = reg1 + 1, then, els, loop, destR) {
    if (tree === Object(tree)) {
      let left = tree.value[0];
      let right = tree.value[1];
      let args = destR ? [null, null, null, null, destR] : [];
      this.generateBoolOp(left, reg1, ...args);
      this.generateBoolOp(right, reg1 + 1);
      let opCode = tree.type.split('_')[1].toUpperCase();
      if (opCode === 'OR' || opCode === 'AND') {
        this.assembly.push(`${opCode} R${reg1}, R${reg2}`);
      } else {
        this.assembly.push(`CMP R${reg1}, R${reg2}`);
        this.assembly.push(`J${opCode} T${this.tCount}`);

        then ?  
          els ? this.generateCode(els, reg1) : null // else section
        : this.assembly.push(`MOV R${reg1}, 0`); 
        
        this.assembly.push(`JMP F${this.fCount}`);
        this.assembly.push(`T${this.tCount++}:`);
        
        then ? this.generateCode(then, reg1) : this.assembly.push(`MOV R${reg1}, -1`); // then section

        if (loop === 'for') {
          this.assembly.push(`LOOP L${this.lCount++}`);
        } else if (loop === 'while') {
          this.assembly.push(`JMP L${this.lCount++}`);
        }
   
        this.assembly.push(`F${this.fCount++}:`);
      }
    } else {
      let res;
      if (tree === 'true' || tree === 'false') {
        res = JSON.parse(tree) ? -1 : 0; // -1 to set every bit in R to 1
      } else {
        res = tree;
      }
      let dest = destR ? destR : res;
      this.assembly.push(`MOV R${reg1}, ${dest}`); 
    }
  }

  generateIf(value, regNum, loop, destR) {
    if (value.length === 3) {
      this.generateBoolOp(value[0], regNum, regNum + 1, value[1], value[2]); 
    } else {
      this.generateBoolOp(value[0], regNum, regNum + 1, value[1], null, loop, destR);
    }
  }

  generateFor(value, regNum) {
    this.generateAssign(value[0], regNum, 'CX');
    this.assembly.push(`L${this.lCount}:`);
    this.generateIf([value[1], value[2]], regNum, 'for', 'CX');
  }

  generateWhile(value, regNum) {
    this.assembly.push(`L${this.lCount}:`);
    this.generateIf([value[0], value[1]], regNum, 'while');
  }

  generateRead(value, regNum) {
    for (let i = value.length - 1; i >= 0; i--) {
      this.assembly.push(`PUSH ${value[i]}`);
    }
    this.assembly.push(`CALL READ`);
  }

  generateWrite(value, regNum) {
    let t;
    for (let i = value.length - 1; i >= 0; i--) {
      t = value[i].type.split('_')[0][0].toUpperCase() + value[i].type.split('_')[0].slice(1);
      this[`generate${t}Op`](value[i], regNum);
      this.assembly.push(`PUSH R${regNum}`);
    }
    this.assembly.push('CALL WRITE');
  }
}