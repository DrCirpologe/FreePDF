const loginBtn = document.getElementById('loginBtn');
const dashboardBtn = document.getElementById('dashboardBtn');
const premiumBtn = document.getElementById('premiumBtn');
const premiumTemplatesSection = document.getElementById('premiumTemplates');
const unlockBtn = document.getElementById('unlockBtn');

function enablePhase2And3() {
	if (loginBtn) loginBtn.classList.remove('hidden');
	if (dashboardBtn) dashboardBtn.classList.remove('hidden');
	if (premiumBtn) premiumBtn.classList.remove('hidden');
	if (premiumTemplatesSection) premiumTemplatesSection.classList.remove('hidden');
	if (unlockBtn) unlockBtn.classList.add('hidden');
}

if (unlockBtn) {
	unlockBtn.addEventListener('click', () => {
		enablePhase2And3();
		alert('Phase 2 und Phase 3 wurden freigeschaltet.');
	});
}

window.enablePhase2And3 = enablePhase2And3;
