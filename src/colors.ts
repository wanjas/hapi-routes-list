import chalk from 'chalk';

type HexColor = `#${string}`;
type KeywordColor = Parameters<typeof chalk.keyword>[0];
export type Color = chalk.Chalk | HexColor | KeywordColor | 'default';

export type Theme = {
  method: Color;
  path: Color;
  strategy: Color;
  scopes: {
    selection: Color;
    required: Color;
    forbidden: Color;
  };
  description: Color;
  mode: {
    optional: Color;
    required: Color;
    try: Color;
  };
  tags: Color;
};

export const defaultTheme: Theme = {
  method: chalk.blue,
  path: 'default',
  strategy: chalk.green,
  scopes: {
    selection: chalk.green,
    required: chalk.magenta,
    forbidden: chalk.red,
  },
  description: chalk.yellow,
  mode: {
    optional: chalk.gray,
    required: chalk.greenBright,
    try: chalk.bgGray,
  },
  tags: chalk.gray,
};

export const noColorTheme: Theme = {
  method: 'default',
  path: 'default',
  strategy: 'default',
  scopes: {
    selection: 'default',
    required: 'default',
    forbidden: 'default',
  },
  description: 'default',
  mode: {
    optional: 'default',
    required: 'default',
    try: 'default',
  },
  tags: 'default',
};

export const rainbowTheme: Theme = {
  method: chalk.red,
  path: '#ff8600',
  strategy: chalk.yellow,
  scopes: {
    selection: chalk.greenBright,
    required: chalk.green,
    forbidden: chalk.bgGreen,
  },
  description: chalk.blueBright,
  mode: {
    optional: chalk.bgCyan,
    required: chalk.blue,
    try: chalk.magentaBright,
  },
  tags: chalk.magenta,
};
