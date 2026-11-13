# crew

跨设备多 Agent 协作，通道是 git。

一个**主脑**指挥任意多台机器上的**节点**——Claude Code 或 Codex CLI 会话。它们之间只通过项目的 git 仓库沟通：不用托管平台 API，不用 Issue，不用 webhook，没有常驻进程。凡是 git 能连上的地方都能跑，所以 GitHub 和自建 GitLab 表现完全一致。

**消息只有在它的提交被推送之后才算送达。** 其余规则都由这一条推导而来。

## 它是什么

一套约定，打包成两个宿主都能装的插件。后台没有任何东西在跑，项目里也只需要 `coordination/` 下的四个文件：

```
coordination/
├── README.md            本项目的设置：分支、时区、心跳超时
├── nodes.yml            登记表：谁在、管哪些文件、向谁汇报
├── brain-to-nodes.md    主脑的通道文件（追加写，单一写者）
└── <node-id>-to-brain.md  每个节点一个（追加写，各自单一写者）
```

## 怎么运作

- **一文件一写者，各写各的分支。** 两边永远不推同一分支，所以不存在推送竞争，分支互相合并时这些文件也不会冲突。这也是所有节点共用一个 git 账号仍然可行的原因——条目 ID 前缀标明了作者，而不是靠提交者身份。
- **用 `git show origin/<branch>:<file>` 读对方**，不要为了读而签出或合并对方分支。
- **追加写。** 更正是一条引用旧 ID 的新条目。日志本身就是台账。
- **泳道**即文件归属，在每个节点的登记行里用 glob 声明。一任务一节点。大范围改动等到声明的**屏障点**再做。
- **心跳**是节点在会话开始和结束时写进自己那一行的时间戳。某一行过期，任何人 fetch 一次就能看出那个会话已经不在了。
- **完成定义**由项目自己写在 `coordination/README.md` 里。主脑每次 checkpoint 先核它，达成就收尾停止——只定义流动的协议会永远跑下去。
- **接管**把任务从失联或被换下的节点移走。被接管方提交、推送到自己的分支、写一条交接条目，然后停手——它不解决冲突。接手方另开新分支，所以被接管方迟到的推送不会造成影响。

## 命令

**加入** —— `/crew:init` · `/crew:leader` · `/crew:node` · `/crew:exit`
**干活** —— `/crew:load` · `/crew:next` · `/crew:new` · `/crew:report` · `/crew:cancel` · `/crew:takeover`
**监盘** —— `/crew:review` · `/crew:board`

在 Codex 上同样的命令是 skill：`$crew-next`、`$crew-report`，依此类推。

## 安装

```bash
# Claude Code
claude plugin marketplace add kamioj/crew
claude plugin install crew@crew

# Codex CLI
codex plugin marketplace add https://github.com/kamioj/crew
codex plugin install crew@crew
```

然后在项目里：执行一次 `/crew:init`，在协调会话上执行 `/crew:leader`，其余每台机器执行 `/crew:node`。

## 调度

主脑靠你已经有的定时能力驱动——宿主自带的定时任务、cron、任务计划程序。crew 不交付常驻进程，也不做唤醒；`templates/checkpoint.md` 是提示词骨架，把项目自己的 review 清单填进去。

节点由人来开。节点恢复工作所需的一切都在仓库里，所以几个月后再开一个会话，成本就是一次 `git fetch`。

## 刻意不做的事

不写脚本、不挂 hook、不封装平台 API、不做看板服务、不做自动唤醒。这套协议必须在 Claude 和 Codex 上、Windows 和 Unix 上、联网和离线时都成立——每多一个机制，就多一个在某个环境里缺席的可能。

代价是没有任何东西强制这些规则。**"忘了推送"没有兜底。** 如果某个项目确实反复出现违反，应该在那个项目里加一个推送前检查，而不是改协议。

## 开发

所有随插件发布的 markdown 都由 `core/` 生成：

```bash
node tools/generate.mjs           # 生成两棵树
node tools/generate.mjs --check   # 产物过期或被手改时返回非零
```

改 `core/`，不要改生成出来的目录。两个宿主有分歧的段落用成对的 `<!-- host:claude -->` / `<!-- host:codex -->` 标记。

[English](README.md)
