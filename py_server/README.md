
## develop
flask --app main run  

## production
gunicorn -w 4 -b 0.0.0.0:8000 'main:app'

## oAuth 公钥
B4LTmASMcNiBc_M4RvjdNyaVf6w31Udp5CvR_va9nj8


## 本地调试
uvx --refresh --from "langgraph-cli[inmem]" --with-editable . --python 3.12 langgraph dev --allow-blocking

## 其他

- [x] 喝杯咖啡
- [ ] 散步