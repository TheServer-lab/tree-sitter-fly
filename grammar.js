/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  assignment: 1,
  or: 2,
  and: 3,
  comparison: 4,
  additive: 5,
  multiplicative: 6,
  unary: 7,
  call: 8,
  member: 9,
};

module.exports = grammar({
  name: 'fly',

  extras: $ => [
    /\s/,
    $.line_comment,
    $.block_comment,
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      $.group_declaration,
      $.job_declaration,
      $.if_statement,
      $.while_statement,
      $.for_statement,
      $.wait_statement,
      $.do_statement,
      $.return_statement,
      $.skip_statement,
      $.getout_statement,
      $.bring_statement,
      $.expression_statement,
    ),

    group_declaration: $ => seq(
      'group',
      field('name', $.identifier),
      optional(seq('from', field('parent', $.identifier))),
      field('body', $.group_body),
    ),

    group_body: $ => seq(
      '{',
      repeat(choice($.field_declaration, $.job_declaration)),
      '}',
    ),

    field_declaration: $ => seq(
      field('name', $.identifier),
      optional(seq('=', field('value', $.expression))),
    ),

    job_declaration: $ => seq(
      'job',
      field('name', $.identifier),
      '(',
      optional($.parameter_list),
      ')',
      field('body', $.block),
    ),

    parameter_list: $ => seq(
      $.identifier,
      repeat(seq(',', $.identifier)),
      optional(','),
    ),

    block: $ => seq('{', repeat($._statement), '}'),

    if_statement: $ => seq(
      'if', $.expression, $.block,
      repeat($.orif_clause),
      optional($.else_clause),
    ),

    orif_clause: $ => seq('orif', $.expression, $.block),
    else_clause: $ => seq('else', $.block),

    while_statement: $ => seq('while', $.expression, $.block),

    for_statement: $ => seq(
      'for', field('variable', $.identifier), 'in',
      field('iterable', $.expression), $.block,
    ),

    wait_statement: $ => seq('wait', field('duration', $.expression)),

    do_statement: $ => seq(
      'do', $.block,
      optional($.grab_clause),
    ),

    grab_clause: $ => seq(
      'grab', optional(seq('(', $.identifier, ')')), $.block,
    ),

    return_statement: $ => seq('give', optional($.expression)),
    skip_statement: $ => 'skip',
    getout_statement: $ => 'getout',

    bring_statement: $ => seq(
      'bring',
      $.identifier,
      optional(seq('as', $.identifier)),
    ),

    expression_statement: $ => $.expression,

    expression: $ => choice(
      $.assignment_expression,
      $.binary_expression,
      $.unary_expression,
      $.call_expression,
      $.member_expression,
      $.subscript_expression,
      $.primary_expression,
    ),

    assignment_expression: $ => prec.right(PREC.assignment, seq(
      field('left', $.assignable),
      '=',
      field('right', $.expression),
    )),

    assignable: $ => choice(
      $.identifier,
      $.member_expression,
      $.subscript_expression,
    ),

    binary_expression: $ => choice(
      prec.left(PREC.or, seq($.expression, 'or', $.expression)),
      prec.left(PREC.and, seq($.expression, 'and', $.expression)),
      prec.left(PREC.comparison, seq(
        $.expression,
        choice('==', '!=', '<', '<=', '>', '>='),
        $.expression,
      )),
      prec.left(PREC.additive, seq($.expression, choice('+', '-'), $.expression)),
      prec.left(PREC.multiplicative, seq($.expression, choice('*', '/', '%'), $.expression)),
    ),

    unary_expression: $ => prec(PREC.unary, seq(
      choice('-', '+', 'not'),
      $.expression,
    )),

    call_expression: $ => prec(PREC.call, seq(
      field('function', $.expression),
      '(',
      optional($.argument_list),
      ')',
    )),

    argument_list: $ => seq(
      $.expression,
      repeat(seq(',', $.expression)),
      optional(','),
    ),

    member_expression: $ => prec(PREC.member, seq(
      field('object', $.expression),
      '.',
      field('property', $.identifier),
    )),

    subscript_expression: $ => prec(PREC.member, seq(
      field('object', $.expression),
      '[',
      field('index', choice($.slice_expression, $.expression)),
      ']',
    )),

    slice_expression: $ => seq(
      optional($.expression), ':', optional($.expression),
      optional(seq(':', optional($.expression))),
    ),

    primary_expression: $ => choice(
      $.identifier,
      $.self,
      $.number,
      $.string,
      $.boolean,
      $.emp,
      $.array,
      $.board,
      $.parenthesized_expression,
    ),

    parenthesized_expression: $ => seq('(', $.expression, ')'),

    array: $ => seq(
      '[',
      optional(seq($.expression, repeat(seq(',', $.expression)), optional(','))),
      ']',
    ),

    board: $ => seq(
      '{',
      optional(seq(
        $.board_entry,
        repeat(seq(optional(','), $.board_entry)),
        optional(','),
      )),
      '}',
    ),

    board_entry: $ => seq($.board_key, ':', $.expression),

    board_key: $ => choice(
      $.number,
      $.string,
      $.boolean,
      $.emp,
    ),

    self: $ => 'self',
    boolean: $ => choice('Yes', 'No'),
    emp: $ => 'EMP',

    number: $ => choice(
      /\d+\.\d+/,
      /\.\d+/,
      /\d+/,
    ),

    string: $ => choice(
      /"(\\.|[^"\\])*"/,
      /'(\\.|[^'\\])*'/,
    ),

    identifier: $ => /[A-Za-z_][A-Za-z0-9_]*/,

    line_comment: $ => /\$[^\n]*/,

    block_comment: $ => token(seq(
      '$$',
      repeat(choice(/[^$]/, /\$[^$]/)),
      '$$',
    )),
  },
});
