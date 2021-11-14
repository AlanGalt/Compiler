class Compiler {
  constructor() {
    this.parser = parser;
  }

  compile(code) {
    this.ids = new Map();
    const lexer = this.parser.lexer;
    lexer.setInput(code);
    while (!lexer.done) {
        let token = lexer.lex();
        if (token in parser.terminals_) {
          token = parser.terminals_[token];
        }
        let lexeme = `${token} "${lexer.yytext}"\n`;
        lexemes.value += lexeme;
    }
    const parsedObj = this.parser.parse(code).value[1].value;
    console.log(JSON.stringify(parsedObj, null, 4));
    for (let operator of parsedObj) {
      console.log(this.generateCode(operator, 0));
    }
  }

  generateCode(tree, regNum) {
    if (typeof tree === 'string') {
      if (Number.isInteger(parseInt(tree))) return tree;
      return tree === 'true' ? 1 : 0; 
    }
    switch (tree.type) {
      case 'assign':
        return this.generateAssign(tree, regNum);
    }
  }

  generateAssign = (tree, regNum) => `MOV ${tree.value[0]}, ${this.generateCode(tree.value[1], regNum)}`;
}