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

function initAdSnow() {
	const adArea = document.getElementById('adCustomArea');
	if (!adArea) return;

	const snowLayer = document.createElement('div');
	snowLayer.className = 'ad-snow-layer';

	const flakeCount = 28;
	for (let index = 0; index < flakeCount; index += 1) {
		const flake = document.createElement('span');
		flake.className = 'ad-snowflake';
		flake.style.left = `${Math.random() * 100}%`;
		flake.style.animationDuration = `${4 + Math.random() * 5}s`;
		flake.style.animationDelay = `${Math.random() * -8}s`;
		flake.style.opacity = `${0.45 + Math.random() * 0.55}`;
		const size = 4 + Math.random() * 7;
		flake.style.width = `${size}px`;
		flake.style.height = `${size}px`;
		snowLayer.appendChild(flake);
	}

	adArea.appendChild(snowLayer);
}

initAdSnow();

window.enablePhase2And3 = enablePhase2And3;
