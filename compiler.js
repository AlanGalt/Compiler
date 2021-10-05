class Compiler {
  lex(code) {
    return code.split(/\s|\n|\/\/.*/).map(s => s.trim()).filter(s => s.length);
  }

  parse(tokens) {
  }

  compile(code) {
    const tokens = this.lex(code);
    return tokens;
  }
}