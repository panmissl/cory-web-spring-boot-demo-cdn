文档：
    https://pro.ant.design/index-cn
    http://ant.design/

//takeLatest, throttle: https://blog.csdn.net/wangweiren_get/article/details/89043113
用户直接用windw.USER，注意判空

列表+详情+新增+编辑+删除：TableList

配置菜单：config/config.js
图片放置在public文件夹下，public文件夹的文件在部署时会直接部署在和js一样的目录，所以部署后访问：比如访问public下的logo.png文件：DOMAIN/logo.png即可

绑定键盘事件：https://github.com/yuanguandong/react-keyevent
参考登录页面
<Keyevent
    events={{
    onEnter: (e) => {
        // console.log('enter key event', e, formRef)
        formRef.current.submit();
    },
    }}
    needFocusing={false}
>
</Keyevent>

富文本编辑器：https://braft.margox.cn/
集成到表单中
没有外边框处理：加样式：https://github.com/margox/braft-editor/issues/564
和 ant.design 的form 表单一起使用，数据加载不上：https://github.com/margox/braft-editor/issues/341
编辑和展示都已经由系统封装好，只需要在后台@Field里加richText=true即可。
但是需要上传文件时要自己传入uploadHandler参数。具体见TableList的注释。

代码编辑器：https://github.com/scniro/react-codemirror2
已经集成到表单中
编辑和展示都已经由系统封装好，只需要在后台@Field里加上code=true即可。

数据字典编辑器，如果类型是数据字典，只需要渲染成数据字典编辑器(用editRender来指定)，就会自动渲染成下拉列表
DatadictEditor
数据字典类型的编辑：字段已经通过后台的设置，然后前端已经内置实现，一般情况下不用自己处理。特殊情况另说。
数据字典字段的展示：后台会查询关联的数据字典，前端自己写listRenderer来渲染。比如level，后台查询到存储成了levelName，前端listRenderer加：{level: (v, r) => r.levelName}

本地运行：
cnpm start
注意：如果没有cnpm，请先安装。如果启动错误，请先cnpm install

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