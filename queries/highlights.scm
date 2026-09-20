; Keywords
[
  "group" "from" "job"
  "if" "orif" "else" "ifnot"
  "while" "for" "in"
  "wait" "do" "grab"
  "give"
  "bring" "as"
  "and" "or" "not"
] @keyword

; Built-in literals
(boolean) @constant.builtin
(emp) @constant.builtin
(self) @variable.builtin
(number) @number
(string) @string

; Declarations
(group_declaration name: (identifier) @type)
(job_declaration name: (identifier) @function)
(field_declaration name: (identifier) @property)

; Access
(member_expression property: (identifier) @property)

; Comments
(line_comment) @comment
(block_comment) @comment

; Statement keywords
(skip_statement) @keyword
(getout_statement) @keyword

; Operators
[
  "=" "==" "!=" "<" "<=" ">" ">="
  "+" "-" "*" "/" "%" ":"
] @operator

; Functions and calls
(call_expression function: (identifier) @function)
