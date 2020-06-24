#!/bin/bash
export DEBIAN_FRONTEND=noninteractive

if [ ! -d "/home/$USER/scaffnode" ]; then
    git clone git@github.com:KishCom/scaffnode.git
fi

if [ $# -eq 0 ]; then
    BRANCH=master
else
    BRANCH=$1
fi

echo "Building scaffnode $BRANCH"
cd /home/$USER/scaffnode;
git fetch
git reset --hard
git checkout origin/$BRANCH
npm install

# Regardless of if changed, copy NGINX configs and restart it
sudo cp /home/$USER/scaffnode/deploy/app.nginx /etc/nginx/sites-enabled/scaffnode
sudo systemctl restart nginx

# Build frontend
cd frontend
npm run build.live
cd ..

# If this script was run as root reset any permissions
if [ "$(id -u)" == "0" ]; then
    chown -R $USER:$USER /home/$USER/scaffnode
fi

# PM2 by default...
pm2 restart scaffnode
pm2 status scaffnode
pm2 logs scaffnode
# ...but you can use systemd service instead:
# sudo systemctl restart scaffnode
