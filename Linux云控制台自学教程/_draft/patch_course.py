# -*- coding: utf-8 -*-
from pathlib import Path
import re

p = Path(__file__).resolve().parents[1] / "assets" / "js" / "course.js"
text = p.read_text(encoding="utf-8")
text = re.sub(r"\bVMD\b", "Course", text)
start = text.find("  Course.COURSE_NAME = ")
end = text.find("  Course.chapter = ")
if start < 0 or end < 0:
    raise SystemExit("registry markers not found")
registry = r"""  Course.COURSE_NAME = 'Linux云控制台自学教程';
  Course.CHAPTERS = [
    { id: 'ch01', no: 1, stage: 1, file: 'ch01_instance.html', title: '控制台里的这台 Linux', short: '实例', parts: ['镜像', '区域', '运行中'], desc: 'web-demo 在 cn-demo-1，由 Ubuntu 22.04 镜像启动。运行中只说明虚拟机开着。' },
    { id: 'ch02', no: 2, stage: 2, file: 'ch02_login.html', title: '登录要三条同时成立', short: '登录', parts: ['用户名', '密钥', 'TCP 22'], desc: 'ubuntu、demo-key、安全组放行 TCP 22，缺一条就进不去。' },
    { id: 'ch03', no: 3, stage: 2, file: 'ch03_path.html', title: '命令落在当前目录', short: '路径', parts: ['当前目录', '相对路径', '绝对路径'], desc: '从 /home/ubuntu 写 nginx.conf，到不了 /etc/nginx/nginx.conf。' },
    { id: 'ch04', no: 4, stage: 2, file: 'ch04_mode.html', title: '密钥绑定了，权限仍会拒绝', short: '权限', parts: ['.ssh', 'authorized_keys', '属主'], desc: '组或其他人可写，或者属主不是 ubuntu，sshd 就不收这把密钥。' },
    { id: 'ch05', no: 5, stage: 2, file: 'ch05_sudo.html', title: '登录用户不是 root', short: 'sudo', parts: ['ubuntu', 'sudo', '/etc'], desc: 'ubuntu 写不了 /etc/nginx/nginx.conf，前面加上 sudo 才可以。' },
    { id: 'ch06', no: 6, stage: 3, file: 'ch06_service.html', title: '运行中不等于有人在听', short: '服务', parts: ['安装', 'active', '0.0.0.0:80'], desc: '实例在跑，nginx 仍可能没装、没启动，或只听 127.0.0.1。' },
    { id: 'ch07', no: 7, stage: 3, file: 'ch07_doors.html', title: '两道门都要放行', short: '两道门', parts: ['安全组', 'ufw', '连接被拒绝'], desc: '安全组不放行会一直转；两道门开了但没进程，是连接被拒绝。' },
    { id: 'ch08', no: 8, stage: 4, file: 'ch08_disk.html', title: '扩容的是块设备', short: '云盘', parts: ['/dev/vdb', '100 GiB', 'df'], desc: '控制台已把数据盘扩到 100 GiB，df 仍显示 20 GiB，直到 resize2fs。' },
    { id: 'ch09', no: 9, stage: 4, file: 'ch09_close.html', title: '用日志把控制台走通', short: '走通', parts: ['现象', '证据', '一条链'], desc: '网页打不开、登不进、空间没变大，各自回到基准算例里的那条证据。' },
  ];
  Course.STAGES = [
    { no: 1, name: '认出台子', desc: '这台 Linux 在控制台的哪个区域、哪份镜像上' },
    { no: 2, name: '进得去', desc: '登录、路径、权限和 sudo' },
    { no: 3, name: '跑起来', desc: '服务在听，两道门都放行' },
    { no: 4, name: '对上证据', desc: '磁盘扩容和一次完整对照' },
  ];
"""
text = text[:start] + registry + text[end:]
needle = "[h('span', { class: 'logo' }, 'VD')"
repl = "[h('span', { class: 'logo' }, 'LX')"
if needle not in text:
    raise SystemExit("logo not found")
text = text.replace(needle, repl, 1)
text = text.replace("车辆多体动力学交互教程", "Linux云控制台自学教程", 1)
if re.search(r"\bVMD\b", text):
    raise SystemExit("VMD still present")
for bad in ("refCar", "vmd-models.js", "VMD.susp", "VMD.tire", "VMD.veh"):
    if bad in text:
        raise SystemExit("vehicle marker " + bad)
p.write_text(text, encoding="utf-8", newline="\n")
print("ok", p.stat().st_size)
