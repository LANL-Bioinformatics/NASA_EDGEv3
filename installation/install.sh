#!/bin/bash
echo "Install LANL EDGE webapp..."
pwd=$PWD
app_home="$(dirname "$pwd")"

#create upload/log/projects/public directories, skip this step for reinstallation
io_home=$app_home/io
if [ ! -d  $io_home ]; then
  echo "Create directories"
  mkdir ${io_home}
  dirs=(
    "upload"
    "upload/files"
    "upload/users"
    "upload/tmp" 
    "log"
    "projects"
    "public"
    "sra"
    "db"
  )

  for dir in "${dirs[@]}"
  do
    mkdir ${io_home}/${dir}
  done

  nextflow_test_data_home=$app_home/workflows/Nextflow/test_data
  if [ -d  $nextflow_test_data_home ]; then
    ln -s ${nextflow_test_data_home} ${io_home}/public/nextflow
  fi
fi

echo "Setup LANL EDGE webapp ..."
#install client
echo "install client..."
cd $app_home/webapp/client
npm install --legacy-peer-deps
#install server
echo "install server..."
cd $app_home/webapp/server
npm install

echo "LANL EDGE webapp successfully installed!"
echo "Next steps:"
echo "1. copy webapp/client/.env.example to webapp/client/.env and update settings in the .env file"
echo "2. inside webapp/client, run command: npm run build"
echo "3. copy webapp/server/.env.example to webapp/server/.env and update settings in the .env file"
echo "4. start MongoDB if it's not started yet"
echo "5. start the webapp in EDGEv3's root directory: pm2 start pm2.config.js"