#!/usr/bin/env node

const fs = require('fs');
const json2markdown = require('json2markdown'); // eslint-disable-line import/no-extraneous-dependencies

const readmeTemplate = fs.readFileSync('./generate-template-readme.md', 'utf8');
const project = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const helpOptions = JSON.parse(fs.readFileSync('./lang/options.json', 'utf8'));
const helpText = helpOptions.map(({ longName, shortName, description }) => {
  return { longName, shortName, description };
});
const helpTextMarkdown = json2markdown(helpText);
const newReadme = readmeTemplate.replace('<%= description %>', project.description).replace('<%= options %>', helpTextMarkdown)

console.log('generating readme...');

fs.writeFile('README.md', newReadme, (err) => {
  if (err) {
    return console.error(err);
  }
  return console.log('new readme saved!');
});
