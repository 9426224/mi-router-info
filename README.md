# 小米历代路由器参数汇总

> 表格图片版请前往此链接获取 https://zhuanlan.zhihu.com/p/13178688078

## 源代码

[mi-router-info.md](./mi-router-info.md)

欢迎贡献

## 如何构建？

### 格式检查（可选）

1. 安装 nodejs
2. 执行 `npm install`
3. 执行 `npm run check` 查看是否有格式问题
4. 执行 `npm run fix` 来自动修正格式问题

### 生成文件

1. 安装 pandoc
2. 生成 html 文件

```console
pandoc --standalone --from gfm --to html5 --css=style.css --embed-resources --metadata pagetitle="小米历代路由器参数汇总" --output=output/output.html mi-router-info.md
```

3. 生成 png 图片文件

```
TBD
```

## 许可

本文档以 MIT 协议发布。详情请见 [LICENSE](LICENSE)。
