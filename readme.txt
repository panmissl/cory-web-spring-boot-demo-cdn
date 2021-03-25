文档：
    https://pro.ant.design/index-cn
    http://ant.design/

//takeLatest, throttle: https://blog.csdn.net/wangweiren_get/article/details/89043113
用户直接用windw.USER，注意判空

列表+详情+新增+编辑+删除：TableList

部署：
1、运行：cnpm run build 进行打包
2、打包完成后将dist目录下的所有文件上传到服务器目录即可

用单独的域名访问，比如：xxcdn.xx.com
上传文件也用单独域名访问，比如：xxdata.xx.com

-------------
DONE:
    新建、编辑的校验：基本校验
    新增、编辑、删除的处理
    ID字段处理
    甚至全部自定义：全部自定义就自己写即可，不要用TableList
    首页：returnUrl不起作用、登录显示两边成功、登录成功时要显示之前的样子
    新建、编辑时的自定义？比如枚举、下拉等
    自定义：渲染、过滤条件渲染（主要是枚举）、自定义操作
    分配资源那里自定义
    增加执行sql的功能，图标：<ConsoleSqlOutlined />

TODO:
    首页

扩展：
    字段定义：比如密码：password：true