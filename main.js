const compileButton = document.getElementById("compile-button");
const code = document.getElementById("code-input");

const compiler = new Compiler();

compileButton.onclick = () => {
  console.log(compiler.compile(code.value));
};

