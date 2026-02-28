#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import download from 'download-git-repo';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

// 定义命令
program
  .version('1.0.0')
  .command('create <project-name>')
  .description('Create a new project from a template')
  .action(async (projectName) => {
    // 1. 检查目录是否已存在
    const targetDir = path.join(process.cwd(), projectName);

    if (fs.existsSync(targetDir)) {
      console.log(chalk.red(`Error: Directory ${projectName} already exists!`));
      process.exit(1);
    }

    const template = {
      url: 'https://github.com/china-difi/mui-template/archive/refs/heads/main.zip'
    };

    console.log(chalk.blue(`\n🚀 Downloading template from ${template.url}...`));

    // 3. 下载模板到临时目录
    const tmpDir = path.join(targetDir, '.tmp');

    await new Promise((resolve, reject) => {
      download(template, tmpDir, { clone: false }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // 4. 读取模板的配置文件（可选，用于更复杂的交互）
    let templateConfig = {};
    const configPath = path.join(tmpDir, 'template.config.json');
    if (fs.existsSync(configPath)) {
      templateConfig = require(configPath);
    }

    // 5. 询问模板特定的变量（例如项目描述、作者）
    const prompts = [];
    if (templateConfig.prompts) {
      prompts.push(...templateConfig.prompts);
    }
    const answers = await inquirer.prompt(prompts);

    // 6. 移动文件并渲染
    // 遍历临时目录所有文件，复制到目标目录，并替换变量
    const files = await fs.readdir(tmpDir);
    for (const file of files) {
      if (file === '.git' || file === 'template.config.json') continue; // 忽略无关文件
      const src = path.join(tmpDir, file);
      const dest = path.join(targetDir, file);
      await fs.move(src, dest, { overwrite: true });
    }

    // 7. 清理和完成
    await fs.remove(tmpDir);
    console.log(chalk.green(`\n✅ Project ${chalk.bold(projectName)} created successfully!`));
    console.log(chalk.cyan(`\nNext steps:`));
    console.log(`  cd ${projectName}`);
    console.log(`  npm install`);
    console.log(`  npm run dev`);
  });

// 解析命令行参数
program.parse(process.argv);
