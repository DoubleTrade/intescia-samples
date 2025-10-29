#!/usr/bin/env node
import path from 'node:path';
import chalk from 'chalk';
import type swagger_schema_official from 'swagger-schema-official';
import { generateApi } from 'swagger-typescript-api';
import config from '../config';

const apiUrl = `${config.documentationUrl}/openapi/intescia-api-v1.json`;


const main = async () => {
  const output = path.join(
    process.cwd(),
    'generated/'
  );
  console.log(`Generating API files in ${output}`);
  try {
    const options = {
      modular: true,
      // templates: './swagger-typescript-templates',
      silent: true,
      cleanOutput: true,
      moduleNameFirstTag: true,
      sortTypes: true,
      disableThrowOnError: true,
      output,
    };
    console.log(chalk.green(`fetching ${apiUrl}`));
    const specResponse = await fetch(`${apiUrl}`);
    if (specResponse.ok) {
      const spec =
            (await specResponse.json()) as swagger_schema_official.Spec;
      await generateApi({
        spec,
        ...options,
      });
    } else {
      console.log(
        chalk.red(
          `Error ${specResponse.status} on ${apiUrl}`
        )
      );
    }
  } catch (error) {
    console.log(chalk.red(`Error on ${apiUrl}`, error));
  }
};

main();
