create systemd
create sshd
invoke systemd add sshd invoke sshd start
set handoff invoke systemd boot
ls
save