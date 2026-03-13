import express from 'express';
import path from 'path';
import downloadFile from './src/download-file.js';
import validateNotebook from './src/validate-notebook.js';
import fs from 'fs';
import { runCheckKeys } from './src/utils/run-checks.js';
import { exec } from 'child_process';

const app = express();

const port = parseInt(process.env.PORT) || 8080;

app.get('/', async (req, res) => {

  res.setHeader("Content-Type", "text/html")
  // Hello there
  res.send('Hello there! Usage: \n' + 'curl https://validate-notebook-j2jrnhonua-lm.a.run.app/1AZCBazYWdN6qW79zZD_tsZBYNxg1PvZw?checks=1,3,4 <br> <b>available checks: </b> <br>' + runCheckKeys.join('<br>') + "<br><br> <b>For Mistral</b>, we need to run all, by default all is run. <br><b>For ServiceNow,</b> we need to choose all except for run check 6 and 10. To by pass the run checks:available misc fields are:<br> - 'allow-todo'<br>- 'allow-generic'<br>- 'allow-no-citation'<br>- 'allow-no-search' <br>- 'allow-hyperlinks' <br>- 'allow-plagiarism' <br>- 'skip-plagiarism' <br>- 'less-functions'");
});

// check installed python version
app.get('/python', async (req, res) => {
  exec('python --version', function (error, stdout) { //Replace echo with any other command.
    return res.send(stdout)
  });
});

app.get('/:id', async (req, res) => {

  try {

    let checks = [];
    if (req.query?.checks) {
      checks = req.query.checks.split(',').map(x => Number(x.trim()));
    }

    //if id does not exist
    if (!req.params.id) {

      res.send('Please provide an id');

      return;
    }

    if (req.params.id.endsWith('.ipynb')) {
      res.send('Please provide an id without the extension');
      return;
    }

    const fileDest = path.join('./check-alone');
    let filePath = '';
    try {
      // create file
      fs.mkdirSync(fileDest, { recursive: true });
      if (req.params.id == 'favicon.ico') {
        return;
      }
      filePath = await downloadFile(req.params.id, fileDest);
      const { errors, warnings, infos, logs, successes } = validateNotebook(filePath, checks);
      res.setHeader('Content-Type', 'application/json');

      res.end(JSON.stringify({ success: Object.keys(errors || {}).length == 0, errors, warnings, infos, logs, successes }));
    }
    catch (error) {
      console.error(error);

      res.send({ success: false, errors: { validation_custom: 'An error occurred while processing the request: ' + error } });
    }
  }
  catch (error) {
    console.error(error);
    res.send('An error occurred while processing the request: ' + error);
  }
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
