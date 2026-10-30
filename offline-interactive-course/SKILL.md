---
name: offline-interactive-course
description: >-
  车辆多体动力学交互式教程的领域入口。生成或续写车辆动力学、悬架、五连杆、K&C、操稳、平顺性、轮胎力、转向、静载荷、弹性元件、整车仿真的离线分章教程时使用；先执行同级 self-study-course，再遵守 domains/vehicle-mbd.md。不要用于其他学科，也不要用于失败用例分析、自动化跑测、Jira 缺陷或测试脚本编写。
---

# 车辆多体动力学教程入口

本目录不再单独维护一套页面框架。生成或续写车辆课时：

1. 先完整执行 [../self-study-course/SKILL.md](../self-study-course/SKILL.md) 的工作流。
2. 大纲定稿前读 [../self-study-course/domains/vehicle-mbd.md](../self-study-course/domains/vehicle-mbd.md)，并遵守其中的运行时名、`refCar`、作者、覆盖范围和易错表。
3. 页面合同、子任务书、校验脚本都用 `self-study-course` 里的版本：
   - [../self-study-course/course-contract.md](../self-study-course/course-contract.md)
   - [../self-study-course/subagent-brief.md](../self-study-course/subagent-brief.md)
   - `python ../self-study-course/scripts/validate_course.py "<课程目录>" --author "<作者>"`

其他学科不要走本技能，直接用 `self-study-course`。
