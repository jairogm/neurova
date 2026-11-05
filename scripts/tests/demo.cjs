const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('NEUROVA.dc.html', 'utf8').match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
class DCLogic {
 constructor(props) { this.props = props; }
 setState(update) { this.state = {...this.state, ...(typeof update === 'function' ? update(this.state) : update)}; }
}
let revoked = false;
const Demo = vm.runInNewContext(source + '\nComponent;', {DCLogic, React: {createElement: () => null}, Date, URL: {createObjectURL: () => 'blob:sample', revokeObjectURL: () => {revoked = true;}}, window: {open: () => {}}});
const demo = new Demo({});
assert.ok(demo.renderVals().patientTabs.some(t => t.label === 'Documents' || JSON.stringify(t).includes('Documents')));
assert.equal(demo.renderVals().consentLabel, 'Consent form missing');
let reset = false;
demo.state.documentFile = {name: 'sample.pdf', type: 'application/pdf', size: 300};
demo.renderVals().uploadDocument({preventDefault() {}, target: {reset() {reset = true;}}});
assert.equal(reset, true);
assert.equal(demo.renderVals().documents.length, 1);
assert.equal(demo.renderVals().consentLabel, 'Consent form uploaded');
assert.ok(demo.renderVals().timeline.some(e => e.title === 'Consent form uploaded'));
demo.state.selectedPatientId = 'david';
assert.equal(demo.renderVals().documents.length, 0);
assert.equal(demo.renderVals().sessions.length, 0);
demo.state.selectedPatientId = 'maya';
demo.renderVals().documents[0].askDelete();
assert.equal(demo.renderVals().confirmTitle, 'Delete document?');
demo.renderVals().closeConfirm();
assert.equal(demo.renderVals().documents.length, 1);
demo.renderVals().documents[0].askDelete();
demo.renderVals().doConfirm();
assert.equal(revoked, true);
assert.equal(demo.renderVals().documents.length, 0);
assert.equal(demo.renderVals().consentLabel, 'Consent form missing');
assert.equal(demo.renderVals().timeline.some(e => e.title === 'Consent form uploaded'), false);
demo.state.documentFile = {name: 'bad.html', type: 'text/html', size: 300};
demo.renderVals().uploadDocument({preventDefault() {}});
assert.equal(demo.state.documents.length, 0);
assert.ok(demo.state.documentMessage.includes('PDF'));
demo.state.timelineFilter = 'payment';
assert.ok(demo.renderVals().timeline.every(e => e.type === 'payment'));
console.log('17 demo interaction checks passed');
