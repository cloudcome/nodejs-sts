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
## v0.1.10
* 增加了本地静态服务器

## v0.1.9
* 修复了linux下全局命令不存在的BUG

## v0.1.5
* 完善了LOG记录，目前有UA、TIME、URL、METHOD、PARSE信息

## v0.1.4
* 更新了404、500的描述
* 修复了`点文件夹`的访问BUG
* 更新了markdown文件的样式
* 增加LOG记录

## v0.1.3
* **S**TATIC **T**RUSTED **S**ERVER => sts

## v0.0.19
* 增加了对markdown文件的支持，支持`.md`、`.mkd`、`.markdown`3种文件后缀
* 增加输出版本号
* 修复了部分BUG

## v0.0.1
* 支持了全局安装以及路径适配