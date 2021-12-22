reset
create systemd
create sshd
invoke systemd add sshd invoke sshd start
create n-arm-bandit/bandit SLOT1
create n-arm-bandit/bandit SLOT2
create n-arm-bandit/bandit SLOT3
create n-arm-bandit/bandit SLOT4
create n-arm-bandit/bandit SLOT5
create n-arm-bandit/agent/exploreOnly explorer
invoke explorer addBandit SLOT1
invoke explorer addBandit SLOT2
invoke explorer addBandit SLOT3
invoke explorer addBandit SLOT4
invoke explorer addBandit SLOT5
invoke systemd add explorer invoke explorer run 100
set handoff invoke systemd boot
set devMode true
ls
save