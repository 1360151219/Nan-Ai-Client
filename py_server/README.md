
## develop

flask --app main run  

## production

gunicorn -w 4 -b 0.0.0.0:8000 'main:app'

## oAuth 公钥
B4LTmASMcNiBc_M4RvjdNyaVf6w31Udp5CvR_va9nj8