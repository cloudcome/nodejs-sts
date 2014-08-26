#sts [![NPM version](https://img.shields.io/npm/v/sts.svg?style=flat)](https://npmjs.org/package/sts)
**S**TATIC **T**RUSTED **S**ERVER => sts


# INSTALL
```
npm i sts -g
```

# USAGE
```
sts -v 
cd your directory
sts 18080 your server name
```

* HTTP静态服务器将运行在当前目录。
* 端口（必须）: `18080`
* 名称（可选，防止在cmd窗口运行多个静态服务器，不知道哪个是哪个）: `your server name`


# VERSION
## v0.1.2
* **S**TATIC **T**RUSTED **S**ERVER => sts

## v0.0.19
* 增加了对markdown文件的支持，支持`.md`、`.mkd`、`.markdown`3种文件后缀
* 增加输出版本号
* 修复了部分BUG

## v0.0.1
* 支持了全局安装以及路径适配