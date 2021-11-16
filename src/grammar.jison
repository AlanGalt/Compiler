/* lexical grammar */
%lex
%%

\s+                     /* skip whitespace */
"//".*                  /* skip comments */

"program"               return 'PROGRAM';
"var"                   return 'VAR';
"begin"                 return 'BEGIN';
"end"                   return 'END';
"int"                   return 'INT';
"bool"                  return 'BOOL';
"if"                    return 'IF';
"then"                  return 'THEN';
"else"                  return 'ELSE';
"for"                   return 'FOR';
"to"                    return 'TO';
"do"                    return 'DO';
"while"                 return 'WHILE';
"read"                  return 'READ';
"write"                 return 'WRITE';
"not"                   return 'NOT';
"or"                    return 'OR';
"and"                   return 'AND';
"true"|"false"          return 'BOOL_CONST';


([-]?[1-9]\d*|0)\b      return 'INT_CONST';
[a-zA-Z][0-9a-zA-Z]*\b  return 'ID';

"=="                    return '==';
">="                    return '>=';
"<="                    return '<=';
"!="                    return '!=';
"="                     return '=';
"*"                     return '*';
"/"                     return '/';
"-"                     return '-';
"+"                     return '+';
"^"                     return '^';
">"                     return '>';
"<"                     return '<';

"("                     return '(';
")"                     return ')';
"{"                     return '{';
"}"                     return '}';
","                     return ',';
";"                     return ';';
":"                     return ':';

<<EOF>>                 return 'EOF';
.                       return 'INVALID';

/lex
/* operator precedence and assosiations */

%right '='
%left  'OR'
%left  'AND'
%left  '==' '!='
%left  '<' '>' '<=' '>='
%left  '+' '-'
%left  '*' '/'
%left  '^'
%right 'NOT'
%left  '(' ')'
%right 'THEN' 'ELSE'

%token INVALID

%start start

/* language grammar */

%ebnf
%%
start
    : program EOF {return $1}
    ;

program 
    : PROGRAM var_section* code_section    {$$ = {type:"program", value:[$2, $3]}}
    ;

var_section
    : VAR declaration+                     {$$ = {type:"variables section", value: $2}}
    ;

code_section
    : BEGIN operator+ END                  {$$ = {type:"code section", value:$2}}
    ;

declaration
    : id_list ':' type ';'                 {initId($1, $3, yylineno); $$ = {type:"declaration", value:$1}}
    ;

type
    : INT 
    | BOOL
    ;

operator
    : assign_op ';'{$$ = {type:"assign", value: $1}}
    | if_op        {$$ = {type:"if",     value: $1}}
    | for_op       {$$ = {type:"for",    value: $1}}
    | while_op     {$$ = {type:"while",  value: $1}}
    | read_op ';'  {$$ = {type:"read",   value: $1}}
    | write_op ';' {$$ = {type:"write",  value: $1}}
    | block_op     {$$ = {type:"block",  value: $1}}
    ;

assign_op
    : ID '=' expression                                  {$$ = [$1, $3]; setId($1, $3, yylineno)}
    ;

if_op
    : IF '(' expression ')' THEN operator                {$$ = [$3, $6]}
    | IF '(' expression ')' THEN operator ELSE operator  {$$ = [$3, $6, $8]}
    ;

for_op
    : FOR '(' assign_op ')' TO '(' expression ')' DO operator            {$$ = [$3, $7, $10]}
    ;

while_op
    : WHILE '(' expression ')' DO operator                       {$$ = [$3, $6]}
    ;

read_op
    : READ '(' id_list ')'                               {$$ = $3}
    ;

write_op
    : WRITE '(' expression_list ')'                      {$$ = $3}
    ;

block_op
    : '{' operator* '}' {$$ = $2}
    ;

expression
    : expression '+'  expression               {$$ = {type: 'int_add',  value:[$1, $3]}}
    | expression '-'  expression               {$$ = {type: 'int_sub',  value:[$1, $3]}}
    | expression '*'  expression               {$$ = {type: 'int_mul',  value:[$1, $3]}}
    | expression '/'  expression               {$$ = {type: 'int_div',  value:[$1, $3]}}
    | expression '^'  expression               {$$ = {type: 'int_pow',  value:[$1, $3]}}
    | expression OR   expression               {$$ = {type: 'bool_or',  value: [$1, $3]}}
    | expression AND  expression               {$$ = {type: 'bool_and', value: [$1, $3]}}
    | expression '>'  expression               {$$ = {type: 'bool_g',   value: [$1, $3]}}
    | expression '<'  expression               {$$ = {type: 'bool_l',   value: [$1, $3]}}
    | expression '==' expression               {$$ = {type: 'bool_e',   value: [$1, $3]}}
    | expression '>=' expression               {$$ = {type: 'bool_ge',  value: [$1, $3]}}
    | expression '<=' expression               {$$ = {type: 'bool_le',  value: [$1, $3]}}
    | expression '!=' expression               {$$ = {type: 'bool_ne',  value: [$1, $3]}}
    | NOT expression                           {$$ = {type: 'bool_not', value: $2}}
    | '(' expression ')'                       {$$ = $2}
    | BOOL_CONST                               {$$ = $1}  
    | INT_CONST                                {$$ = $1}
    | ID                                       {$$ = $1}
    ;

id_list
    : id_list ',' ID                           {$$ = concatList($1, $3)}
    | ID                                       {$$ = $1}
    ;

expression_list
    : expression_list ',' expression           {$$ = concatList($1, $3)}
    | expression                               {$$ = $1}
    ;
