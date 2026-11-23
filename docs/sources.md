# 数据来源

表中每一行都由公开资料整理，优先采用拆机实测，其次官方规格，最后是上市报道。这里记录主要来源，方便后续核对。

## 通用来源

- [acwifi 拆机路由器配置表](https://www.acwifi.net/15132.html)：按型号汇总 CPU、内存、闪存和 FEM 的表格，老型号主要参照它。
- [acwifi 小米分类](https://www.acwifi.net/category/brand/xiaomi)：逐篇拆机文章，芯片丝印和容量以文章为准。
- 小米商城产品页（规格参数）与米家产品库（`home.mi.com/...?model=xiaomi.router.*`）：确认型号代号、网口和无线规格。
- 上市时间与首发价：IT之家、快科技等上市报道。

## 逐型号补充来源

| 型号                           | 来源                                                                                                                                                                                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 小米BE6500                     | [acwifi 拆机](https://www.acwifi.net/30388.html)、[IT之家开售](https://www.ithome.com/0/788/888.htm)、[小米商城规格](https://m.mi.com/commodity/detail/20276)                                                                                  |
| 小米BE7200 Pro                 | [IT之家发布](https://www.ithome.com/0/947/128.htm)、[smzdm 拆机](https://post.smzdm.com/p/a3m3d035/)、[小米商城](https://www.mi.com/shop/buy/detail?product_id=24611)、米家产品库 `xiaomi.router.rp09`                                         |
| 小米BE10000 Pro                | [小米产品页](https://www.mi.com/xiaomi-routers/be-10000-pro)、[acwifi 上市](https://www.acwifi.net/32345.html)、[Chiphell 配置](https://www.chiphell.com/forum.php?mod=viewthread&tid=2749458)、米家产品库 `xiaomi.router.rp04`                |
| 小米全屋路由 BE3600 Pro 网线版 | [acwifi 套装拆机](https://www.acwifi.net/32986.html)、[acwifi 上市](https://www.acwifi.net/31382.html)、[快科技预售](https://www.163.com/dy/article/K0IG7D9D0511CPVM.html)、[小米产品页](https://www.mi.com/xiaomi-routers/be-3600-pro-wired1) |
| 小米AX3000T 高通版             | [acwifi 拆机](https://www.acwifi.net/32952.html)、[OpenWrt RD03v2 说明](https://github.com/ADCDS/openwrt-xiaomi-ax3000t-rd03v2)                                                                                                                |
| 小米BE3600 2.5G                | [acwifi 拆机](https://www.acwifi.net/26827.html)、[1.25A 版本拆机](https://www.acwifi.net/34321.html)                                                                                                                                          |
| 小米BE3600 Pro                 | [acwifi 拆机](https://www.acwifi.net/29524.html)、[上市预售](https://www.acwifi.net/29074.html)                                                                                                                                                |
| 小米BE5000                     | [acwifi 拆机](https://www.acwifi.net/29460.html)                                                                                                                                                                                               |
| 小米AX3000E                    | [acwifi 拆机](https://www.acwifi.net/29584.html)                                                                                                                                                                                               |
| 小米BE7000                     | [acwifi 拆机](https://www.acwifi.net/24893.html)、[芯片汇总](https://www.acwifi.net/24559.html)                                                                                                                                                |
| 小米万兆 AX10000               | [acwifi 拆机](https://www.acwifi.net/23365.html)                                                                                                                                                                                               |
| 小米路由器Mesh                 | [小米官方规格](https://www.mi.com/mesh/specs)、[wikidevi](<https://wikidevi.wi-cat.com/index.php?title=Xiaomi_Mesh_Router_AC1300_(D01)>)                                                                                                       |

## 说明

- 老型号（2014–2022）主要沿用 acwifi 配置表与对应拆机文，个别颗粒型号以丝印为准；表里保留 `-` 而不是猜测。
- 官方页面只写营销口径（如“四核高通”），具体芯片以拆机为准；两者冲突时以拆机为准，并在 `docs/variants.md` 记录批次差异。
- 价格只用于确认上市节点，不进入表格。
