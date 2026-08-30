// ============================================
// Calcura — calculator logic
// ============================================

const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const keypad = document.getElementById('keypad');

let currentValue = '0';
let previousValue = null;
let currentOp = null;
let overwrite = true;
const MAX_DIGITS = 14;

function formatNumber(numStr) {
  if (numStr === 'Error') return numStr;

  const [intPart, decPart] = numStr.split('.');
  const isNegative = intPart.startsWith('-');
  const digits = isNegative ? intPart.slice(1) : intPart;

  const withCommas = digits.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ','
  );

  const sign = isNegative ? '-' : '';

  return decPart !== undefined
    ? `${sign}${withCommas}.${decPart}`
    : `${sign}${withCommas}`;
}

function updateScreen() {
  resultEl.textContent = formatNumber(currentValue);

  if (previousValue !== null && currentOp) {
    expressionEl.textContent =
      `${formatNumber(previousValue)} ${currentOp}`;
  } else {
    expressionEl.textContent = '\u00A0';
  }
}

function inputDigit(digit) {
  if (currentValue === 'Error') {
    resetAll();
  }

  if (overwrite) {
    currentValue = digit;
    overwrite = false;
  } else {
    if (
      currentValue
        .replace('-', '')
        .replace('.', '')
        .length >= MAX_DIGITS
    ) {
      return;
    }

    currentValue =
      currentValue === '0'
        ? digit
        : currentValue + digit;
  }

  updateScreen();
}

function inputDecimal() {
  if (currentValue === 'Error') resetAll();

  if (overwrite) {
    currentValue = '0.';
    overwrite = false;
    updateScreen();
    return;
  }

  if (!currentValue.includes('.')) {
    currentValue += '.';
    updateScreen();
  }
}

function compute(a, b, op) {
  const x = parseFloat(a);
  const y = parseFloat(b);

  switch (op) {
    case '+':
      return x + y;

    case '−':
      return x - y;

    case '×':
      return x * y;

    case '÷':
      if (y === 0) return NaN;
      return x / y;

    default:
      return y;
  }
}

function trimResult(num) {
  if (!isFinite(num)) return 'Error';

  let str =
    String(Math.round(num * 1e10) / 1e10);

  if (
    str
      .replace('-', '')
      .replace('.', '')
      .length > MAX_DIGITS
  ) {
    str = num.toExponential(6);
  }

  return str;
}

function chooseOperator(op) {
  if (currentValue === 'Error') return;

  if (currentOp && !overwrite) {
    const outcome =
      compute(
        previousValue,
        currentValue,
        currentOp
      );

    const trimmed = trimResult(outcome);

    if (trimmed === 'Error') {
      showError();
      return;
    }

    previousValue = trimmed;
    currentValue = trimmed;
  } else {
    previousValue = currentValue;
  }

  currentOp = op;
  overwrite = true;

  updateScreen();
  highlightOperator(op);
}

function equals() {
  if (
    currentOp === null ||
    previousValue === null ||
    currentValue === 'Error'
  ) {
    return;
  }

  const outcome =
    compute(
      previousValue,
      currentValue,
      currentOp
    );

  const trimmed = trimResult(outcome);

  if (trimmed === 'Error') {
    showError();
    return;
  }

  currentValue = trimmed;
  previousValue = null;
  currentOp = null;
  overwrite = true;

  updateScreen();
  clearOperatorHighlight();
}

function showError() {
  currentValue = 'Error';
  previousValue = null;
  currentOp = null;
  overwrite = true;

  resultEl.textContent = 'Error';
  resultEl.classList.add('error');

  expressionEl.textContent = '\u00A0';

  clearOperatorHighlight();

  setTimeout(() => {
    resultEl.classList.remove('error');
  }, 400);
}

function negate() {
  if (
    currentValue === 'Error' ||
    currentValue === '0'
  ) {
    return;
  }

  currentValue =
    currentValue.startsWith('-')
      ? currentValue.slice(1)
      : '-' + currentValue;

  updateScreen();
}

function percent() {
  if (currentValue === 'Error') return;

  const val =
    parseFloat(currentValue) / 100;

  currentValue = trimResult(val);

  updateScreen();
}

function resetAll() {
  currentValue = '0';
  previousValue = null;
  currentOp = null;
  overwrite = true;

  clearOperatorHighlight();
  updateScreen();
}

function highlightOperator(op) {
  clearOperatorHighlight();

  const btn =
    keypad.querySelector(`[data-op="${op}"]`);

  if (btn) {
    btn.classList.add('active-op');
  }
}

function clearOperatorHighlight() {
  keypad
    .querySelectorAll('.key-op')
    .forEach((b) =>
      b.classList.remove('active-op')
    );
}

function pulse(button) {
  if (!button) return;

  button.classList.remove('pressed');

  void button.offsetWidth;

  button.classList.add('pressed');

  setTimeout(() => {
    button.classList.remove('pressed');
  }, 350);
}


// ---------- click handling ----------

keypad.addEventListener('click', (e) => {
  const btn = e.target.closest('.key');

  if (!btn) return;

  pulse(btn);

  const {
    num,
    op,
    action
  } = btn.dataset;

  if (num !== undefined) {
    inputDigit(num);

  } else if (op !== undefined) {
    chooseOperator(op);

  } else if (action === 'decimal') {
    inputDecimal();

  } else if (action === 'clear') {
    resetAll();

  } else if (action === 'negate') {
    negate();

  } else if (action === 'percent') {
    percent();

  } else if (action === 'equals') {
    equals();
  }
});


// ---------- keyboard support ----------

const keyMap = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷'
};

window.addEventListener('keydown', (e) => {
  const { key } = e;

  if (/^[0-9]$/.test(key)) {
    inputDigit(key);

    pulse(
      keypad.querySelector(
        `[data-num="${key}"]`
      )
    );

    return;
  }

  if (key === '.') {
    inputDecimal();

    pulse(
      keypad.querySelector(
        '[data-action="decimal"]'
      )
    );

    return;
  }

  if (keyMap[key]) {
    chooseOperator(keyMap[key]);

    pulse(
      keypad.querySelector(
        `[data-op="${keyMap[key]}"]`
      )
    );

    return;
  }

  if (
    key === 'Enter' ||
    key === '='
  ) {
    e.preventDefault();

    equals();

    pulse(
      keypad.querySelector(
        '[data-action="equals"]'
      )
    );

    return;
  }

  if (key === 'Escape') {
    resetAll();

    pulse(
      keypad.querySelector(
        '[data-action="clear"]'
      )
    );

    return;
  }

  if (key === 'Backspace') {
    if (currentValue === 'Error') {
      resetAll();
      return;
    }

    currentValue =
      currentValue.length > 1
        ? currentValue.slice(0, -1)
        : '0';

    if (currentValue === '-') {
      currentValue = '0';
    }

    updateScreen();

    return;
  }

  if (key === '%') {
    percent();

    pulse(
      keypad.querySelector(
        '[data-action="percent"]'
      )
    );
  }
});

updateScreen();