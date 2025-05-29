module.exports = {
  root: true,
  extends: ["universe/native", "universe/web"],
  ignorePatterns: ["build"],
  rules: {
    // Just adding this cause changing prettier config alone won't work.
    "prettier/prettier": [
      "error",
      {
        printWidth: 100,
      },
    ],
    // This is just to disable all these useless import rules.
    "import/order": "off",
    "import/first": "off",
    "import/newline-after-import": "off",
    "import/no-duplicates": "off",
    "import/no-unresolved": "off",
    "import/named": "off",
    "import/default": "off",
    "import/namespace": "off",
  },
}
