# 基于微信小程序的英语四六级学习系统

## 项目简介
本项目是一个基于UniApp + uniCloud开发的英语四六级学习系统微信小程序。旨在为备考英语四六级的学生提供一个全面、便捷的学习平台。系统实际实现了单词学习、听力训练、阅读理解、写作练习、翻译练习等多个功能模块，并提供了模拟考试和真题练习功能，帮助学生更好地备考。

## 项目详细介绍
### 系统概述
本英语四六级学习系统是一款专为大学生备考英语四六级考试设计的微信小程序。系统采用了现代化的技术架构和用户友好的界面设计，旨在提供一站式的英语四六级备考解决方案。用户可以随时随地通过微信小程序进行学习和练习，系统会记录学习进度和成绩数据，帮助用户有针对性地提高英语水平。

### 用户使用流程
1. **注册与登录**
   - 用户首次使用时，可通过手机号快速注册账号
   - 注册后，系统会自动创建个人学习档案
   - 后续使用时，可直接通过手机号登录系统
   - 登录后，系统会自动同步云端数据，确保学习进度不丢失

2. **首页功能**
   - 提供快速入口访问各个学习模块
   - 包括单词学习、听力训练、阅读理解、写作练习和翻译练习

3. **个人中心**
   - 查看和编辑个人基本信息
   - 查看学习记录
   - 管理收藏内容
   - 调整系统设置

### 核心功能模块
1. **单词学习模块**
   - **词汇浏览**：用户可以浏览完整的四六级词汇表
   - **单词学习**：系统会展示单词的音标、释义、例句和用法说明
   - **发音练习**：支持标准发音播放，帮助用户掌握正确的发音
   - **学习进度**：自动记录已学习和已掌握的单词数量

2. **听力训练模块**
   - **听力材料**：提供历年四六级真题和模拟题的听力材料
   - **音频控制**：支持音频播放、暂停、重复和速度调节
   - **听力练习**：按照考试真实场景设计练习流程，包括短对话、长对话和听力篇章
   - **答案解析**：提供详细的听力原文和答案解析，帮助理解听力内容

3. **阅读理解模块**
   - **阅读材料**：收录历年四六级考试阅读真题和模拟题
   - **阅读练习**：模拟真实考试环境，完成阅读理解题目
   - **答案详解**：提供详细的答案解析和文章结构分析

4. **写作练习模块**
   - **写作真题**：收录历年四六级写作真题
   - **范文学习**：提供高分范文供学习参考
   - **自主练习**：用户可以根据题目进行写作练习

5. **翻译练习模块**
   - **翻译真题**：收录历年四六级翻译真题
   - **参考译文**：提供标准参考译文
   - **自主练习**：用户可以进行翻译练习并对照参考答案

6. **考试模块**
   - **模拟考试**：完整模拟四六级考试流程和时间安排
   - **真题练习**：可以选择历年真题进行针对性练习
   - **成绩分析**：详细分析考试成绩，指出优势和不足

7. **学习记录模块**
   - **练习历史**：记录用户的所有练习历史和成绩
   - **学习时长**：统计练习时长
   - **成绩统计**：展示学习效果
   - **分页功能**：支持按页浏览大量学习记录

### 用户价值
1. **高效备考**：系统整合了四六级考试的所有考点和题型，帮助用户全面、系统地备考，提高学习效率。
2. **便捷性**：微信小程序形式，无需下载安装，随时随地可以学习，充分利用碎片化时间。
3. **全面覆盖**：涵盖四六级考试的所有模块和题型，确保备考无死角。

## 数据库设计
### 数据库概述
本项目使用uniCloud云数据库作为后端数据存储方案。云数据库采用文档型数据库结构，具有高性能、高可用性和易扩展的特点。系统的所有数据都存储在云端，通过云函数进行安全访问和操作，确保数据的安全性和一致性。

### 数据表结构
系统包含以下主要数据表：

#### 1. 用户表 (users)
存储用户的基本信息和学习状态。
| 字段名 | 类型 | 描述 |
|-------|------|------|
| _id | string | 用户ID，系统自动生成 |
| account | string | 用户账号 |
| password | string | 用户密码 |
| nickname | string | 用户昵称 |
| avatar | string | 用户头像URL |
| level | string | 用户等级，如"英语小白"、"英语初学者"等 |
| study_days | int | 累计学习天数 |
| points | int | 已掌握单词数量 |
| create_date | timestamp | 账号创建时间 |

#### 2. 单词表 (words)
存储四六级词汇库中的单词信息。
| 字段名 | 类型 | 描述 |
|-------|------|------|
| _id | string | 单词ID，系统自动生成 |
| word | string | 英文单词 |
| phonetic | string | 音标 |
| meaning | string | 中文释义 |
| example | string | 例句 |
| difficulty | int | 难度等级：1-简单，2-中等，3-困难 |
| category | string | 单词分类：CET4/CET6 |
| create_date | timestamp | 创建时间 |

#### 3. 用户单词进度表 (user_word_progress)
记录用户对每个单词的学习进度。
| 字段名 | 类型 | 描述 |
|-------|------|------|
| _id | string | 记录ID，系统自动生成 |
| user_id | string | 用户ID，关联users表 |
| word_id | string | 单词ID，关联words表 |
| status | string | 学习状态：new-未学习，learning-学习中，learned-已掌握 |
| review_times | int | 复习次数 |
| last_review_date | timestamp | 最后复习时间 |
| create_date | timestamp | 创建时间 |

#### 4. 听力题目表 (listening_questions)
存储听力练习的题目信息。
| 字段名 | 类型 | 描述 |
|-------|------|------|
| _id | string | 题目ID，系统自动生成 |
| category | string | 类别：CET4/CET6 |
| set_number | int | 套题编号，同一套题目使用相同编号 |
| question_content | array | 题目内容，包含section_name、description和questions等信息 |
| answers | array | 正确答案列表，包含key、content和score等信息 |
| audio_file | string | 音频文件路径 |
| question_type | string | 题目类型：mock-模拟题，exam-真题 |
| year | string | 年份 |
| month | string | 月份 |
| create_date | timestamp | 创建时间 |

#### 5. 阅读题目表 (reading_questions)
存储阅读理解练习的题目信息。
| 字段名 | 类型 | 描述 |
|-------|------|------|
| _id | string | 题目ID，系统自动生成 |
| category | string | 题目类别：CET4/CET6 |
| set_number | int | 套题编号 |
| passage | string | 阅读文章内容 |
| little_title | string | 小标题 |
| questions | array | 问题列表，包含question_number、question和options等信息 |
| answers | array | 答案列表，包含key、content和score等信息 |
| question_type | string | 题目类型：mock-模拟题，exam-真题 |
| year | string | 年份 |
| month | string | 月份 |
| create_date | timestamp | 创建时间 |

#### 6. 写作题目表 (writing_questions)
存储写作练习的题目信息。
| 字段名 | 类型 | 描述 |
|-------|------|------|
| _id | string | 题目ID，系统自动生成 |
| category | string | 题目类别：CET4/CET6 |
| set_number | int | 套题编号 |
| little_title | string | 小标题 |
| title | string | 作文标题 |
| word_limit | object | 字数限制，包含min和max |
| reference_answer | string | 参考范文 |
| score | number | 满分分值 |
| question_type | string | 题目类型：mock-模拟题，exam-真题 |
| year | string | 年份 |
| month | string | 月份 |
| create_date | timestamp | 创建时间 |

#### 7. 翻译题目表 (translation_questions)
存储翻译练习的题目信息。
| 字段名 | 类型 | 描述 |
|-------|------|------|
| _id | string | 题目ID，系统自动生成 |
| category | string | 题目类别：CET4/CET6 |
| set_number | int | 套题编号 |
| little_title | string | 小标题 |
| original_text | string | 原文内容 |
| reference_translation | string | 参考译文 |
| score | number | 满分分值 |
| question_type | string | 题目类型：mock-模拟题，exam-真题 |
| year | string | 年份 |
| month | string | 月份 |
| create_date | timestamp | 创建时间 |

#### 8. 通用题目表 (questions)
存储通用题目信息，主要用于模拟考试和真题练习。
| 字段名 | 类型 | 描述 |
|-------|------|------|
| _id | string | 题目ID，系统自动生成 |
| title | string | 题目标题 |
| options | array | 选项列表，包含key和content |
| answer | string | 正确答案：A, B, C, D |
| analysis | string | 题目解析 |
| type | string | 题目类型：mock-模拟考试，real-真题练习 |
| difficulty | int | 难度等级：1-简单，2-中等，3-困难 |
| create_date | timestamp | 创建时间 |

#### 9. 练习记录表 (practice_records)
记录用户的练习历史和成绩。
| 字段名 | 类型 | 描述 |
|-------|------|------|
| _id | string | 记录ID，系统自动生成 |
| user_id | string | 用户ID，关联users表 |
| question_id | string | 题目ID |
| practice_type | string | 练习类型：mock-模拟考试，real-真题练习，listening-听力练习，reading-阅读练习，writing-写作练习，word-单词练习 |
| category | string | 类别：CET4/CET6 |
| set_number | int | 套题编号 |
| lastScore | int | 上次得分 |
| highestScore | int | 最高得分 |
| lastCorrectRate | double | 上次正确率 |
| highestCorrectRate | double | 最高正确率 |
| lastCorrectCount | int | 上次正确题目数量 |
| highestCorrectCount | int | 最高正确题目数量 |
| practice_count | int | 练习次数 |
| questions_count | int | 题目总数 |
| scores | object | 得分详情，包含listening、reading、translation、writing和total |
| duration | int | 练习时长 |
| year | string | 年份 |
| month | string | 月份 |
| create_date | timestamp | 创建时间 |

### 数据表初始数据插入

所有的数据初始相关文件已在根目录下，分别是根目录下四个json文件：writing_questionsDataInit、listening_questionsDataInit、reading_questionsDataInit、translation_questionsDataInit文件，根据uniapp初始数据导入教程导入到云服务器中即可。

### 数据表关系
系统中的数据表之间存在以下关系：

1. **用户与单词进度**：一个用户可以有多个单词进度记录，形成一对多关系。
   - users._id → user_word_progress.user_id

2. **单词与单词进度**：一个单词可以被多个用户学习，形成一对多关系。
   - words._id → user_word_progress.word_id

3. **用户与练习记录**：一个用户可以有多个练习记录，形成一对多关系。
   - users._id → practice_records.user_id

### 数据库ER图
```
+------------+       +-------------------+       +--------+
|   users    |       | user_word_progress|       |  words |
+------------+       +-------------------+       +--------+
| _id        |<----->| user_id           |       | _id    |
| account    |       | word_id           |<----->| word   |
| password   |       | status            |       | phonetic|
| nickname   |       | review_times      |       | meaning |
| avatar     |       | last_review_date  |       | example |
| level      |       | create_date       |       | difficulty|
| study_days |       +-------------------+       | category|
| points     |                                   | create_date|
| create_date|                                   +--------+
+------------+
      ^
      |
      |
+-----+------+       
|practice_records|    
+------------+       
| _id        |       
| user_id    |<----->
| question_id|       
| practice_type|     
| category   |       
| set_number |       
| lastScore  |       
| highestScore|      
| create_date|                             
+------------+                             
                                           
+----------------+    +----------------+   
|listening_questions| |reading_questions|  
+----------------+    +----------------+   
| _id            |    | _id            |
| category       |    | category       |   
| set_number     |    | set_number     |   
| question_content|   | passage        |   
| answers        |    | questions      |   
| audio_file     |    | answers        |   
| ...            |    | ...            |   
+----------------+    +----------------+   
                                           
+----------------+    +-------------------+
|writing_questions|    |translation_questions|
+----------------+    +-------------------+
| _id            |    | _id               |
| category       |    | category          | 
| set_number     |    | set_number        | 
| title          |    | original_text     | 
| word_limit     |    | reference_translation|
| reference_answer|   | score             | 
| ...            |    | ...               | 
+----------------+    +-------------------+ 
                                            
                      +----------------+    
                      |   questions    |    
                      +----------------+    
                      | _id            |
                      | title          |
                      | options        |
                      | answer         |
                      | analysis       |
                      | type           |
                      | difficulty     |
                      | create_date    |
                      +----------------+
```

### 数据安全与权限控制
系统对数据库的访问权限进行了严格控制：
1. **用户数据**：只有用户自己可以读取和修改自己的数据
2. **题库数据**：所有用户可以读取，但不能修改或删除
3. **学习记录**：只有用户自己可以读取和创建自己的学习记录

通过uniCloud的权限控制机制，确保数据的安全性和隐私保护。

## 技术栈
- 前端框架：UniApp（Vue3）
- UI组件：uni-ui
- 后端服务：uniCloud
- 数据库：uniCloud云数据库
- 开发工具：HBuilderX、微信开发者工具

## 功能特点
1. 用户系统
   - 手机号注册/登录
   - 个人信息管理
   - 学习进度追踪

2. 单词学习
   - 四六级词汇库
   - 单词发音播放
   - 学习进度记录

3. 听力训练
   - 真题听力练习
   - 模拟听力训练
   - 音频播放控制
   - 答案解析功能

4. 阅读理解
   - 真题阅读练习
   - 模拟阅读训练
   - 详细解析说明

5. 写作练习
   - 历年真题
   - 范文学习

6. 翻译练习
   - 真题翻译练习
   - 参考译文对照

7. 考试模块
   - 真题模拟
   - 成绩分析

8. 学习记录
   - 练习历史记录
   - 成绩统计分析
   - 学习时长统计
   - 分页浏览功能

## 项目结构
```
├── pages                    // 页面文件目录
│   ├── index               // 首页
│   │   └── index.vue      // 首页
│   ├── words               // 单词学习
│   │   └── words.vue      // 单词学习页面
│   ├── listening           // 听力练习
│   │   └── listening.vue  // 听力练习页面
│   ├── reading             // 阅读理解
│   │   └── reading.vue    // 阅读理解页面
│   ├── writing             // 写作练习
│   │   └── writing.vue    // 写作练习页面
│   ├── translation         // 翻译练习
│   │   └── translation.vue // 翻译练习页面
│   ├── practice            // 练习中心
│   │   ├── practice.vue   // 练习中心主页
│   │   ├── mock-exam      // 模拟考试
│   │   │   └── mock-exam.vue // 模拟考试页面
│   │   └── real-exam      // 真题练习
│   │       └── real-exam.vue // 真题练习页面
│   ├── login               // 登录注册
│   │   ├── login.vue      // 登录页面
│   │   └── register.vue   // 注册页面
│   └── mine                // 个人中心
│       ├── mine.vue       // 个人中心主页
│       ├── center.vue     // 个人信息页面
│       ├── settings       // 设置
│       │   └── settings.vue // 设置页面
│       ├── study-plan     // 学习计划
│       │   └── study-plan.vue // 学习计划页面
│       ├── favorites      // 收藏夹
│       │   └── favorites.vue // 收藏夹页面
│       └── learning-records // 学习记录
│           └── learning-records.vue // 学习记录页面
├── static                  // 静态资源目录
├── store                   // 状态管理目录
├── uni_modules             // uni扩展组件目录
├── uniCloud-aliyun         // 云开发目录
│   ├── cloudfunctions      // 云函数
│   │   ├── common         // 公共模块
│   │   ├── getExamQuestions // 获取考试题目
│   │   ├── getListeningQuestions // 获取听力题目
│   │   ├── getMockExamQuestions // 获取模拟考试题目
│   │   ├── getPracticeRecords // 获取练习记录
│   │   ├── getReadingQuestions // 获取阅读题目
│   │   ├── getRealExamQuestions // 获取真题题目
│   │   ├── getTranslationQuestions // 获取翻译题目
│   │   ├── getUserStatistics // 获取用户统计数据
│   │   ├── getWordList    // 获取单词列表
│   │   ├── getWordProgress // 获取单词学习进度
│   │   ├── getWritingQuestions // 获取写作题目
│   │   ├── saveAndUpdatePracticeRecord // 保存和更新练习记录
│   │   ├── simpleLogin    // 简单登录
│   │   ├── simpleRegister // 简单注册
│   │   ├── updateUserInfo // 更新用户信息
│   │   └── updateWordProgress // 更新单词学习进度
│   └── database           // 数据库集合Schema
│       ├── listening_questions.schema.json // 听力题目集合
│       ├── practice_records.schema.json // 练习记录集合
│       ├── questions.schema.json // 题目集合
│       ├── reading_questions.schema.json // 阅读题目集合
│       ├── translation_questions.schema.json // 翻译题目集合
│       ├── users.schema.json // 用户集合
│       ├── user_word_progress.schema.json // 用户单词进度集合
│       ├── words.schema.json // 单词集合
│       └── writing_questions.schema.json // 写作题目集合
├── App.vue                 // 应用入口文件
├── main.js                 // 主入口文件
├── manifest.json           // 应用配置文件
├── pages.json              // 页面配置文件
└── uni.scss                // 全局样式文件
```

## 环境要求
1. 开发环境
   - Node.js 12.0+
   - HBuilderX 3.0+
   - 微信开发者工具
   - 注册uniCloud账号

2. 运行环境
   - 支持Android 5.0+
   - 支持iOS 10.0+
   - 支持微信最新版本

## 项目部署
1. 环境配置
   ```bash
   # 安装Node.js
   访问 https://nodejs.org/ 下载安装最新LTS版本

   # 安装HBuilderX
   访问 https://www.dcloud.io/hbuilderx.html 下载安装

   # 安装微信开发者工具
   访问 https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html 下载安装
   ```

2. 项目安装
   ```bash
   # 克隆项目
   git clone [项目地址]

   # 进入项目目录
   cd EnglishCET-4andCET-6LearningSystem

   # 安装依赖
   npm install
   ```

3. uniCloud配置
   - 登录HBuilderX
   - 开通uniCloud服务
   - 创建云服务空间
   - 关联云服务空间到项目
   - 上传部署云函数
   - 初始化数据库

4. 小程序配置
   - 注册微信小程序账号
   - 在微信开发者工具中导入项目
   - 配置小程序AppID
   - 开通小程序云开发
   - 配置服务器域名

## 运行部署
1. 本地开发
   ```bash
   # 在HBuilderX中运行
   1. 打开项目
   2. 点击运行到浏览器/模拟器
   3. 选择运行平台

   # 在微信开发者工具中运行
   1. 导入项目
   2. 点击编译
   3. 在模拟器中预览
   ```

2. 生产部署
   ```bash
   # 打包发布
   1. HBuilderX中点击发行
   2. 选择发布到微信小程序
   3. 填写小程序相关信息
   4. 上传代码
   5. 提交审核
   ```

## 注意事项
1. 开发注意事项
   - 确保Node.js版本兼容性
   - 使用HBuilderX最新版本
   - 及时更新微信开发者工具
   - 注意API调用频率限制
   - 关注数据安全和用户隐私

2. 部署注意事项
   - 确保云函数已正确部署
   - 检查数据库权限配置
   - 注意小程序大小限制
   - 测试各项功能完整性
   - 关注服务器资源使用情况
 