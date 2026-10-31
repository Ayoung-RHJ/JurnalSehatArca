/* =========================================================
   Muscles and exercises
   ========================================================= */
const MNAME = { chest:['Chest','Dada'], shoulders:['Shoulders','Bahu'], biceps:['Biceps','Bisep'], triceps:['Triceps','Trisep'], forearms:['Forearms','Lengan bawah'],
  abs:['Abs','Perut'], obliques:['Obliques','Perut samping'], back:['Upper back and lats','Punggung atas'], traps:['Traps','Trapezius'], lowerback:['Lower back','Punggung bawah'],
  glutes:['Glutes','Bokong'], quads:['Quads','Paha depan'], hamstrings:['Hamstrings','Paha belakang'], calves:['Calves','Betis'] };
const EX = {
  goblet: { n:'Goblet squat', g:'legs', sz:'M', m:['quads','glutes'], s:['abs','hamstrings'], avoid:['knee'],
    cue:['Chest tall, knees follow your toes.','Dada tegak, lutut searah jari kaki.'],
    how:[['Hold one dumbbell upright against your chest, feet shoulder-width.','Push your hips back and sit down between your heels.','Drive through your whole foot to stand up.'],
         ['Pegang satu dumbbell tegak di depan dada, kaki selebar bahu.','Dorong pinggul ke belakang dan duduk di antara tumit.','Dorong lewat seluruh telapak kaki untuk berdiri.']],
    f:[P({ a1:[30,135], a2:[25,140], db:'g' }), P({ t:28, l1:[85,115], l2:[85,115], a1:[30,135], a2:[25,140], db:'g' })] },
  rdl: { n:'Romanian deadlift', g:'legs', sz:'L', m:['hamstrings','glutes'], s:['lowerback','forearms'], avoid:['lowerback'],
    cue:['Hips back, back flat.','Pinggul ke belakang, punggung lurus.'],
    how:[['Stand tall, dumbbells in front of your thighs, knees soft.','Push your hips back and slide the weights down your legs.','Stop when the hamstrings stretch, squeeze your glutes to stand.'],
         ['Berdiri tegak, dumbbell di depan paha, lutut sedikit ditekuk.','Dorong pinggul ke belakang dan turunkan beban menyusuri kaki.','Berhenti saat paha belakang terasa tertarik, kencangkan bokong untuk berdiri.']],
    f:[P({ db:'2' }), P({ t:75, l1:[10,15], l2:[10,15], db:'2' })] },
  lunge: { n:'Reverse lunge', g:'legs', sz:'M', side:1, m:['quads','glutes'], s:['hamstrings','calves'], avoid:['knee'],
    cue:['Front knee stays over the ankle.','Lutut depan tetap di atas pergelangan kaki.'],
    how:[['Stand tall with a dumbbell in each hand.','Step one foot back and lower the back knee toward the floor.','Push through the front heel to return. Finish all reps, then switch legs.'],
         ['Berdiri tegak dengan dumbbell di tiap tangan.','Langkahkan satu kaki ke belakang dan turunkan lutut belakang ke lantai.','Dorong lewat tumit depan untuk kembali. Selesaikan semua repetisi, lalu ganti kaki.']],
    f:[P({ db:'2' }), P({ db:'2', t:4, l1:[80,90], l2:[-5,80], f2:-60 })] },
  bridge: { n:'Glute bridge', g:'legs', sz:'L', m:['glutes'], s:['hamstrings','lowerback'], supine:1,
    cue:['Squeeze hard at the top.','Kencangkan bokong di atas.'],
    how:[['Lie on your back, knees bent, feet flat. Rest a dumbbell on your hips.','Squeeze your glutes and lift until shoulders, hips and knees line up.','Pause for one second, then lower slowly.'],
         ['Berbaring telentang, lutut ditekuk, telapak kaki rata. Letakkan dumbbell di pinggul.','Kencangkan bokong dan angkat sampai bahu, pinggul, dan lutut sejajar.','Tahan satu detik, lalu turunkan pelan.']],
    f:[P({ ...LY, l1:[135,105], l2:[135,105], a1:[90,0], a2:[90,0] }), P({ t:-110, l1:[108,98], l2:[108,98], a1:[90,0], a2:[90,0], x:-6 })] },
  calf: { n:'Calf raise', g:'legs', sz:'L', m:['calves'], s:[], tempo:2200,
    cue:['All the way up, slow on the way down.','Naik setinggi mungkin, turun pelan.'],
    how:[['Stand with dumbbells at your sides, feet hip-width.','Rise onto the balls of your feet as high as you can.','Lower slowly. Strong calves keep you light on your feet.'],
         ['Berdiri dengan dumbbell di samping, kaki selebar pinggul.','Jinjit setinggi mungkin.','Turunkan pelan. Betis kuat membuat langkahmu ringan.']],
    f:[P({ db:'2' }), P({ db:'2', f1:-45, f2:-45 })] },
  swing: { n:'Dumbbell swing', g:'legs', sz:'M', m:['glutes','hamstrings'], s:['lowerback','shoulders','abs'], avoid:['lowerback'], tempo:2000,
    cue:['Power comes from your hips, not your arms.','Tenaga dari pinggul, bukan dari lengan.'],
    how:[['Hold one dumbbell with both hands, feet a bit wider than shoulders.','Hinge and let the weight swing back between your legs.','Snap your hips forward so it floats to chest height.'],
         ['Pegang satu dumbbell dengan dua tangan, kaki sedikit lebih lebar dari bahu.','Membungkuk dan biarkan beban berayun ke belakang di antara kaki.','Hentakkan pinggul ke depan sampai beban melayang setinggi dada.']],
    f:[P({ t:70, l1:[15,25], l2:[15,25], a1:[-15,0], a2:[-15,0], db:'g' }), P({ a1:[90,0], a2:[90,0], db:'g' })] },
  thruster: { n:'Thruster', g:'legs', sz:'S', m:['quads','shoulders'], s:['glutes','triceps','abs'], avoid:['shoulder','knee'],
    cue:['Squat, then drive up and press in one move.','Squat, lalu dorong naik dan tekan ke atas dalam satu gerakan.'],
    how:[['Hold dumbbells at your shoulders, feet shoulder-width.','Squat down with your chest tall.','Drive up hard and use that power to press the weights overhead.'],
         ['Pegang dumbbell di bahu, kaki selebar bahu.','Squat dengan dada tegak.','Dorong naik dengan kuat dan pakai tenaganya untuk menekan beban ke atas.']],
    f:[P({ t:20, l1:[85,115], l2:[85,115], a1:[40,130], a2:[40,130], db:'2' }), P({ a1:[175,0], a2:[175,0], db:'2' })] },
  floor_press: { n:'Floor press', g:'push', sz:'M', m:['chest','triceps'], s:['shoulders'], supine:1,
    cue:['Elbows about 45° from your body.','Siku sekitar 45° dari badan.'],
    how:[['Lie on the floor, knees bent, a dumbbell in each hand above your chest.','Lower until your upper arms touch the floor.','Press straight back up and squeeze your chest.'],
         ['Berbaring di lantai, lutut ditekuk, dumbbell di tiap tangan di atas dada.','Turunkan sampai lengan atas menyentuh lantai.','Dorong lurus ke atas dan kencangkan dada.']],
    f:[P({ ...LY, a1:[95,85], a2:[95,85], db:'2' }), P({ ...LY, a1:[180,0], a2:[180,0], db:'2' })] },
  pushup: { n:'Push-up', g:'push', sz:0, m:['chest','triceps'], s:['shoulders','abs'], avoid:['wrist'],
    cue:['Body in one straight line. Knees down is fine.','Badan lurus satu garis. Boleh bertumpu di lutut.'],
    how:[['Hands under your shoulders, body straight from head to heels.','Lower your chest toward the floor, elbows at about 45°.','Push the floor away to come back up.'],
         ['Tangan di bawah bahu, badan lurus dari kepala sampai tumit.','Turunkan dada ke lantai, siku sekitar 45°.','Dorong lantai untuk naik kembali.']],
    f:[P({ t:78, a1:[0,0], a2:[0,0], l1:[-78,0], l2:[-78,0], f1:-80, f2:-80, x:-10 }), P({ t:88, a1:[-45,45], a2:[-45,45], l1:[-88,0], l2:[-88,0], f1:-80, f2:-80, x:-10 })] },
  press: { n:'Shoulder press', g:'push', sz:'S', m:['shoulders'], s:['triceps','abs'], avoid:['shoulder'],
    cue:['Ribs down, no leaning back.','Rusuk turun, jangan condong ke belakang.'],
    how:[['Stand tall, dumbbells at shoulder height, palms forward.','Press straight up until your arms are almost straight.','Lower with control back to your shoulders.'],
         ['Berdiri tegak, dumbbell setinggi bahu, telapak menghadap depan.','Dorong lurus ke atas sampai lengan hampir lurus.','Turunkan terkontrol kembali ke bahu.']],
    f:[P({ v:'f', a1:[90,90], a2:[90,90], l1:[8,0], l2:[8,0], db:'2' }), P({ v:'f', a1:[172,0], a2:[172,0], l1:[8,0], l2:[8,0], db:'2' })] },
  lateral: { n:'Lateral raise', g:'push', sz:'S', m:['shoulders'], s:['traps'],
    cue:['Lead with your elbows, stop at shoulder height.','Angkat dipimpin siku, berhenti setinggi bahu.'],
    how:[['Stand with light dumbbells at your sides.','Raise your arms out to the sides with a soft bend in the elbows.','Stop at shoulder height and lower slowly.'],
         ['Berdiri dengan dumbbell ringan di samping.','Angkat lengan ke samping dengan siku sedikit ditekuk.','Berhenti setinggi bahu dan turunkan pelan.']],
    f:[P({ v:'f', a1:[10,5], a2:[10,5], l1:[8,0], l2:[8,0], db:'2' }), P({ v:'f', a1:[88,5], a2:[88,5], l1:[8,0], l2:[8,0], db:'2' })] },
  tri_oh: { n:'Overhead triceps extension', g:'push', sz:'S', m:['triceps'], s:['shoulders'], avoid:['shoulder'],
    cue:['Elbows point up and stay still.','Siku menghadap atas dan tetap diam.'],
    how:[['Hold one dumbbell overhead with both hands.','Lower it behind your head by bending only your elbows.','Straighten your arms to lift it back up.'],
         ['Pegang satu dumbbell di atas kepala dengan dua tangan.','Turunkan ke belakang kepala dengan menekuk siku saja.','Luruskan lengan untuk mengangkat kembali.']],
    f:[P({ a1:[172,168], a2:[168,172], db:'g' }), P({ a1:[172,0], a2:[168,0], db:'g' })] },
  row1: { n:'One-arm row', g:'pull', sz:'M', side:1, m:['back'], s:['biceps','shoulders'],
    cue:['Pull to your hip, not your chest.','Tarik ke pinggul, bukan ke dada.'],
    how:[['Free hand on a bench, chair or your knee, back flat.','Pull the dumbbell up toward your hip, elbow close to your body.','Pause, then lower slowly. Finish all reps, then switch sides.'],
         ['Tangan bebas bertumpu di bangku, kursi, atau lutut, punggung lurus.','Tarik dumbbell ke arah pinggul, siku dekat badan.','Tahan, lalu turunkan pelan. Selesaikan semua repetisi, lalu ganti sisi.']],
    f:[P({ t:72, l1:[22,30], l2:[-12,15], a2:[22,0], a1:[0,0], db:'1' }), P({ t:72, l1:[22,30], l2:[-12,15], a2:[22,0], a1:[-80,80], db:'1' })] },
  rowbent: { n:'Bent-over row', g:'pull', sz:'M', m:['back','traps'], s:['biceps','lowerback'], avoid:['lowerback'],
    cue:['Squeeze your shoulder blades together.','Rapatkan tulang belikat.'],
    how:[['Hinge forward with a flat back, dumbbells hanging.','Pull both weights toward your hips.','Lower slowly and keep your back still.'],
         ['Membungkuk dengan punggung lurus, dumbbell menggantung.','Tarik kedua beban ke arah pinggul.','Turunkan pelan dan jaga punggung tetap diam.']],
    f:[P({ t:60, l1:[15,28], l2:[15,28], a1:[0,0], a2:[0,0], db:'2' }), P({ t:60, l1:[15,28], l2:[15,28], a1:[-75,75], a2:[-75,75], db:'2' })] },
  curl: { n:'Biceps curl', g:'pull', sz:'S', m:['biceps'], s:['forearms'],
    cue:['Elbows pinned to your sides.','Siku menempel di samping badan.'],
    how:[['Stand tall, dumbbells at your sides, palms forward.','Curl up without moving your elbows.','Lower for a slow count of two.'],
         ['Berdiri tegak, dumbbell di samping, telapak menghadap depan.','Angkat tanpa menggerakkan siku.','Turunkan pelan dalam hitungan dua.']],
    f:[P({ db:'2' }), P({ a1:[8,135], a2:[8,135], db:'2' })] },
  hammer: { n:'Hammer curl', g:'pull', sz:'S', m:['biceps','forearms'], s:[],
    cue:['Palms face each other the whole time.','Telapak saling berhadapan sepanjang gerakan.'],
    how:[['Hold the dumbbells like hammers, palms facing in.','Curl up, elbows still.','Lower slowly. Builds grip for a tight fist.'],
         ['Pegang dumbbell seperti palu, telapak menghadap ke dalam.','Angkat, siku tetap diam.','Turunkan pelan. Melatih genggaman untuk kepalan yang rapat.']],
    f:[P({ db:'2' }), P({ a1:[8,135], a2:[8,135], db:'2' })] },
  pullover: { n:'Dumbbell pullover', g:'pull', sz:'M', m:['back','chest'], s:['triceps','abs'], avoid:['shoulder'], supine:1,
    cue:['Slow stretch, ribs stay down.','Regangkan pelan, rusuk tetap turun.'],
    how:[['Lie on your back holding one dumbbell over your chest with both hands.','Lower it back over your head with slightly bent elbows.','Pull it back over your chest using your back and chest.'],
         ['Berbaring telentang memegang satu dumbbell di atas dada dengan dua tangan.','Turunkan ke belakang kepala dengan siku sedikit ditekuk.','Tarik kembali ke atas dada pakai otot punggung dan dada.']],
    f:[P({ ...LY, x:6, a1:[178,0], a2:[178,0], db:'g' }), P({ ...LY, x:6, a1:[255,10], a2:[255,10], db:'g' })] },
  farmer: { n:'Farmer hold', g:'pull', sz:'L', secs:1, m:['forearms','traps'], s:['abs','shoulders'],
    cue:['Shoulders back, stand tall, breathe.','Bahu ke belakang, berdiri tegak, bernapas.'],
    how:[['Pick up your heaviest dumbbells.','Stand tall or march slowly in place.','Grip hard. A strong grip keeps your fist tight.'],
         ['Angkat dumbbell terberatmu.','Berdiri tegak atau jalan pelan di tempat.','Genggam kuat. Genggaman kuat membuat kepalan rapat.']],
    f:[P({ db:'2', l1:[30,45] }), P({ db:'2', l2:[30,45] })] },
  plank: { n:'Forearm plank', g:'core', sz:0, secs:1, m:['abs'], s:['shoulders','glutes'], prone:1,
    cue:['Squeeze glutes, belly button in.','Kencangkan bokong, tarik pusar ke dalam.'],
    how:[['Forearms on the floor, elbows under your shoulders.','Lift your body into a straight line.','Hold and breathe. Don’t let your hips sag.'],
         ['Lengan bawah di lantai, siku di bawah bahu.','Angkat badan sampai lurus satu garis.','Tahan dan bernapas. Jangan biarkan pinggul turun.']],
    f:[P({ t:92, a1:[0,90], a2:[0,90], l1:[-86,0], l2:[-86,0], f1:-80, f2:-80, x:-10 }), P({ t:90, a1:[0,90], a2:[0,90], l1:[-88,0], l2:[-88,0], f1:-80, f2:-80, x:-10 })] },
  deadbug: { n:'Dead bug', g:'core', sz:0, side:1, m:['abs'], s:['obliques'], supine:1,
    cue:['Lower back pressed into the floor.','Punggung bawah menempel ke lantai.'],
    how:[['Lie on your back, arms up, knees bent over your hips.','Slowly reach one arm back and the opposite leg out.','Return and switch. Keep your lower back flat.'],
         ['Berbaring telentang, tangan ke atas, lutut ditekuk di atas pinggul.','Pelan-pelan julurkan satu tangan ke belakang dan kaki seberangnya ke depan.','Kembali dan ganti sisi. Jaga punggung bawah tetap rata.']],
    f:[P({ ...LY, x:14, a1:[180,0], a2:[180,0], l1:[180,90], l2:[180,90] }), P({ ...LY, x:14, a1:[255,0], a2:[180,0], l1:[180,90], l2:[100,5] })] },
  twist: { n:'Russian twist', g:'core', sz:'S', m:['obliques','abs'], s:[], avoid:['lowerback'], tempo:1600,
    cue:['Turn your shoulders, not just your arms.','Putar bahu, bukan hanya lengan.'],
    how:[['Sit and lean back slightly, feet on the floor or lifted.','Hold a light dumbbell at your chest.','Rotate side to side. Each side counts as one.'],
         ['Duduk dan condong sedikit ke belakang, kaki di lantai atau diangkat.','Pegang dumbbell ringan di depan dada.','Putar ke kiri dan kanan. Tiap sisi dihitung satu.']],
    f:[P({ ...SEAT, a1:[95,35], a2:[95,35], db:'g' }), P({ ...SEAT, t:-24, a1:[60,45], a2:[120,25], db:'g' })] }
};
Object.values(EX).forEach(e => { if (!e.tempo) e.tempo = e.side ? 2600 : 3000; });

/* Muscle map */
const MM_BASE = ox => `<g transform="translate(${ox} 0)"><g class="base"><circle cx="50" cy="14" r="10"/><rect x="45" y="22" width="10" height="10"/><path d="M28 32 Q50 26 72 32 L70 70 Q66 96 64 110 L36 110 Q34 96 30 70 Z"/></g>
  <path class="limb" stroke-width="10" d="M27 36 L19 70 L14 104"/><path class="limb" stroke-width="10" d="M73 36 L81 70 L86 104"/>
  <path class="limb" stroke-width="15" d="M43 108 L41 150 L41 198"/><path class="limb" stroke-width="15" d="M57 108 L59 150 L59 198"/></g>`;
const SH = '<circle cx="27" cy="38" r="6.5"/><circle cx="73" cy="38" r="6.5"/>';
const ARM = '<ellipse cx="22" cy="57" rx="4.5" ry="10"/><ellipse cx="78" cy="57" rx="4.5" ry="10"/>';
const FORE = '<ellipse cx="16" cy="88" rx="4" ry="12"/><ellipse cx="84" cy="88" rx="4" ry="12"/>';
const MMR = {
  f: { chest:'<ellipse cx="40" cy="46" rx="10" ry="7"/><ellipse cx="60" cy="46" rx="10" ry="7"/>', shoulders:SH, biceps:ARM, forearms:FORE,
       abs:'<rect x="44" y="57" width="12" height="40" rx="4"/>', obliques:'<ellipse cx="36" cy="78" rx="4" ry="12"/><ellipse cx="64" cy="78" rx="4" ry="12"/>',
       quads:'<ellipse cx="41" cy="133" rx="7" ry="20"/><ellipse cx="59" cy="133" rx="7" ry="20"/>' },
  b: { traps:'<path d="M40 30 L50 25 L60 30 L56 42 L44 42 Z"/>', shoulders:SH,
       back:'<path d="M32 44 Q40 42 47 46 L47 80 Q39 74 32 60 Z"/><path d="M68 44 Q60 42 53 46 L53 80 Q61 74 68 60 Z"/>',
       triceps:ARM, forearms:FORE, lowerback:'<rect x="44" y="84" width="12" height="18" rx="4"/>',
       glutes:'<ellipse cx="42" cy="113" rx="9" ry="9"/><ellipse cx="58" cy="113" rx="9" ry="9"/>',
       hamstrings:'<ellipse cx="41" cy="142" rx="7" ry="17"/><ellipse cx="59" cy="142" rx="7" ry="17"/>',
       calves:'<ellipse cx="41" cy="176" rx="5.5" ry="12"/><ellipse cx="59" cy="176" rx="5.5" ry="12"/>' }
};
function mmap(p = [], s = []) {
  const g = (v, ox) => `<g transform="translate(${ox} 0)">${Object.entries(MMR[v]).map(([k, svg]) => `<g class="${p.includes(k) ? 'p' : s.includes(k) ? 's' : 'off'}">${svg}</g>`).join('')}</g>`;
  const label = tt('Main muscles: ', 'Otot utama: ') + p.map(x => L(MNAME[x])).join(', ');
  return `<svg class="mm" viewBox="0 0 220 216" role="img" aria-label="${label}">${MM_BASE(5)}${MM_BASE(115)}${g('f', 5)}${g('b', 115)}
    <text x="55" y="214" text-anchor="middle">${tt('Front','Depan')}</text><text x="165" y="214" text-anchor="middle">${tt('Back','Belakang')}</text></svg>`;
}
const mmKey = (p, s) => `<div class="mm-key"><span><i style="background:var(--glow)"></i>${tt('Main','Utama')}: ${p.map(x => L(MNAME[x])).join(', ')}</span>${s.length ? `<span><i style="background:var(--glow2)"></i>${tt('Helping','Pembantu')}: ${s.map(x => L(MNAME[x])).join(', ')}</span>` : ''}</div>`;

/* Feet seen from above, with the pivoting foot highlighted */
const SHOE = 'M0 -21 C9 -21 11 -9 10 2 C9 13 7 21 0 21 C-7 21 -9 13 -10 2 C-11 -9 -9 -21 0 -21Z';
function feetSVG(st, piv) {
  const m = st === 'southpaw' ? -1 : 1, lead = st === 'southpaw' ? tt('right','kanan') : tt('left','kiri'), rear = st === 'southpaw' ? tt('left','kiri') : tt('right','kanan');
  const arrow = (x, y) => `<path class="piv" d="M${x - 17} ${y - 10} A19 19 0 1 1 ${x - 6} ${y + 18}"/><path class="pivh" d="M${x - 12} ${y + 13} L${x - 1} ${y + 22} L${x - 11} ${y + 25}Z"/>`;
  return `<svg class="feet" viewBox="0 0 220 150" role="img" aria-label="${tt('Foot position from above','Posisi kaki dilihat dari atas')}">
    <g transform="translate(110 72) scale(${m} 1)">
      <line class="dash" x1="-22" y1="-26" x2="24" y2="24"/>
      <g transform="translate(-22 -26) rotate(18)"><path class="shoe${piv === 'lead' ? ' lit' : ''}" d="${SHOE}"/></g>
      <g transform="translate(24 24) rotate(42)"><path class="shoe${piv === 'rear' ? ' lit' : ''}" d="${SHOE}"/><circle class="heel" cy="13" r="5"/></g>
      ${piv === 'lead' ? arrow(-22, -26) : ''}${piv === 'rear' ? arrow(24, 24) : ''}
    </g>
    <text x="${110 - m * 64}" y="36" text-anchor="middle">${tt('Lead foot','Kaki depan')} (${lead})</text>
    <text x="${110 + m * 64}" y="118" text-anchor="middle">${tt('Rear foot','Kaki belakang')} (${rear})</text>
    <text x="110" y="144" text-anchor="middle">${piv ? tt('Pivot on the lit foot','Putar di kaki yang menyala') : tt('Red dot: heel up','Titik merah: tumit naik')}</text></svg>`;
}

/* Illustrated people: profiles and coaches */
/* Illustrated people: profile avatars by age group, plus coaches */
const PCOLORS = ['#1F44C4','#0F1D3D','#5B7BE0','#7D8AA6','#2A63D9','#3B4F86'];
const ageGroup = a => { a = Number(a) || 30; return a < 13 ? 'kid' : a < 18 ? 'teen' : a < 60 ? 'adult' : 'elder'; };
const AGEG = { kid:[['Kids','Anak'],'6–12'], teen:[['Teen','Remaja'],'13–17'], adult:[['Adult','Dewasa'],'18–59'], elder:[['Elder','Lansia'],'60+'] };
const ageLabel = a => { const g = AGEG[ageGroup(a)]; return `${L(g[0])}, ${g[1]}`; };
const AVIMG = {
  coach_F:'img/avatars/coach_F.webp',
  coach_M:'img/avatars/coach_M.webp',
  kid_F:'img/avatars/kid_F.webp',
  kid_M:'img/avatars/kid_M.webp',
  teen_F:'img/avatars/teen_F.webp',
  teen_M:'img/avatars/teen_M.webp',
  adult_F:'img/avatars/adult_F.webp',
  adult_M:'img/avatars/adult_M.webp',
  elder_F:'img/avatars/elder_F.webp',
  elder_M:'img/avatars/elder_M.webp'
};
function avatarSVG({ sex = 'male', color = '#1F44C4', coach = false, age = 30 } = {}) {
  if (coach) return `<span class="av av-img av-coach"><img src="${AVIMG[sex === 'female' ? 'coach_F' : 'coach_M']}" alt="" draggable="false"></span>`;
  if (!coach) return `<span class="av av-img" style="background:color-mix(in srgb, ${color} 22%, #F3F5F9)"><img src="${AVIMG[ageGroup(age) + '_' + (sex === 'female' ? 'F' : 'M')]}" alt="" draggable="false"></span>`;
  const fem = sex === 'female', grp = coach ? 'adult' : ageGroup(age), skin = '#C68A5E', ol = '#0F1D3D';
  const hair = grp === 'elder' ? '#D5DAE3' : '#231A15';
  const kid = grp === 'kid', teen = grp === 'teen', elder = grp === 'elder';
  const hy = kid ? 47 : 45, hr = kid ? 19.5 : 17;
  const top = coach ? (fem ? '#1F44C4' : '#0F1D3D') : color;
  const bg = coach ? `<circle cx="50" cy="50" r="50" fill="#C3CBD8"/>` : `<circle cx="50" cy="50" r="50" fill="${color}" opacity=".16"/>`;
  const body = kid ? `<path d="M22 100 Q24 79 50 77 Q76 79 78 100Z" fill="${top}" stroke="${ol}" stroke-width="2.5"/>`
    : `<path d="M14 100 Q16 73 50 71 Q84 73 86 100Z" fill="${top}" stroke="${ol}" stroke-width="2.5"/>`;
  const hood = teen ? `<path d="M30 76 Q50 92 70 76" fill="none" stroke="${ol}" stroke-width="2.2"/><path d="M44 84 L43 96 M56 84 L57 96" stroke="#F3F5F9" stroke-width="2.4" stroke-linecap="round"/>` : '';
  const neck = `<rect x="43.5" y="${kid ? 61 : 57}" width="13" height="${kid ? 15 : 17}" rx="5" fill="${skin}" stroke="${ol}" stroke-width="2.5"/>`;
  let back = '', front = '';
  if (fem) {
    if (kid) { back = `<circle cx="27" cy="52" r="7" fill="${hair}" stroke="${ol}" stroke-width="2"/><circle cx="73" cy="52" r="7" fill="${hair}" stroke="${ol}" stroke-width="2"/>`;
      front = `<path d="M31 47 Q30 26 50 26 Q70 26 69 47 Q64 34 50 35 Q36 34 31 47Z" fill="${hair}"/><circle cx="27" cy="52" r="2.6" fill="#5B7BE0"/><circle cx="73" cy="52" r="2.6" fill="#5B7BE0"/>`; }
    else if (teen) { back = `<path d="M62 27 Q82 24 80 44 Q78 58 70 62 Q76 46 66 36Z" fill="${hair}" stroke="${ol}" stroke-width="2"/>`;
      front = `<path d="M33 45 Q31 26 50 26 Q69 26 67 44 Q60 31 47 33 Q38 35 33 45Z" fill="${hair}"/>`; }
    else if (elder) { back = `<path d="M33 48 Q30 70 40 76 L60 76 Q70 70 67 48Z" fill="${hair}"/>`;
      front = `<path d="M32 46 Q31 26 50 26 Q69 26 68 46 Q64 33 50 33 Q40 33 34 40Z" fill="${hair}"/><circle cx="50" cy="23" r="7.5" fill="${hair}" stroke="${ol}" stroke-width="1.8"/>`; }
    else { back = `<path d="M31 46 Q27 78 40 84 L60 84 Q73 78 69 46Z" fill="${hair}"/>`;
      front = `<path d="M32 46 Q31 25 50 25 Q69 25 68 46 Q64 33 50 33 Q40 33 34 40Z" fill="${hair}"/><circle cx="68" cy="30" r="7.5" fill="${hair}"/>`; }
  } else {
    if (kid) front = `<path d="M31 45 Q31 25 50 26 Q69 25 69 45 Q66 36 58 34 L55 29 L51 34 L46 29 L42 34 Q35 36 31 45Z" fill="${hair}"/>`;
    else if (teen) front = `<path d="M33 43 Q32 25 51 25 Q68 25 67 42 Q62 31 52 35 Q46 37 40 34 Q35 36 33 43Z" fill="${hair}"/>`;
    else if (elder) front = `<path d="M33.5 47 Q32 36 36 32 Q36 40 38 44Z M66.5 47 Q68 36 64 32 Q64 40 62 44Z" fill="${hair}" stroke="${ol}" stroke-width="1.2"/>`;
    else front = `<path d="M33 42 Q33 26 50 26 Q67 26 67 42 Q63 33 50 34 Q37 33 33 42Z" fill="${hair}"/>`;
  }
  const ey = hy + 1, eo = kid ? 7 : 6;
  const eyes = `<circle cx="${50 - eo}" cy="${ey}" r="${kid ? 2.4 : 2.1}" fill="${ol}"/><circle cx="${50 + eo}" cy="${ey}" r="${kid ? 2.4 : 2.1}" fill="${ol}"/>`;
  const glasses = elder ? `<g fill="none" stroke="${ol}" stroke-width="1.8"><circle cx="44" cy="${ey}" r="5"/><circle cx="56" cy="${ey}" r="5"/><path d="M49 ${ey} H51"/></g>` : '';
  const cheeks = kid ? `<circle cx="38" cy="${ey + 6}" r="3.2" fill="#E9A486" opacity=".75"/><circle cx="62" cy="${ey + 6}" r="3.2" fill="#E9A486" opacity=".75"/>` : '';
  const my = hy + 8;
  const mouth = `<path d="M44 ${my} Q50 ${my + 5.5} 56 ${my}" stroke="${ol}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  const coachBits = coach ? (fem ? `<path d="M33 37 Q50 28 67 37" stroke="#1F44C4" stroke-width="5" fill="none"/>`
      : `<path d="M31 37 Q33 21 50 21 Q67 21 69 37Z" fill="#1F44C4" stroke="${ol}" stroke-width="2.5"/><path d="M62 36 L81 38" stroke="${ol}" stroke-width="4.5" stroke-linecap="round"/>`)
    + `<path d="M38 72 L50 90 L62 72" stroke="#F3F5F9" stroke-width="3" fill="none"/><circle cx="50" cy="91" r="4" fill="#C3CBD8" stroke="${ol}" stroke-width="1.6"/>` : '';
  return `<svg class="av" viewBox="0 0 100 100" aria-hidden="true"><g>${bg}${back}${body}${hood}${neck}
    <circle cx="50" cy="${hy}" r="${hr}" fill="${skin}" stroke="${ol}" stroke-width="2.5"/>${front}${eyes}${glasses}${cheeks}${mouth}${coachBits}</g></svg>`;
}
const avatarFor = entry => { const pr = store.get('p:' + entry.id + ':profile', {}) || {}; return avatarSVG({ sex:entry.sex, color:PCOLORS[(entry.color || 0) % PCOLORS.length], age:pr.age }); };
const coachAv = () => avatarSVG({ sex:(PROF && PROF.voice) || 'female', coach:true });

/* Icons and scene art */
/* Goal icons and small art, in logo colours */
const ICONS = { fat:I('flame'), muscle:I('workouts'), fight:I('glove'), learn:I('feet'), health:I('heart') };
const FLAME = I('flame');
const RULER = '<g opacity=".9"><line x1="28" y1="34" x2="28" y2="206" stroke="#9AA5BD" stroke-width="3"/>' +
  Array.from({ length:9 }, (_, i) => `<line x1="28" x2="${i % 2 ? 36 : 42}" y1="${46 + i * 20}" y2="${46 + i * 20}" stroke="#9AA5BD" stroke-width="2"/>`).join('') +
  '<path d="M48 54 l14 -7 v14z" fill="#1F44C4"/><path d="M150 196 h50 v10 h-50z" fill="#9AA5BD" opacity=".5"/></g>';
const HEART = '<g transform="translate(172 52)"><path class="beat" d="M0 14 C-22 -2 -14 -22 0 -10 C14 -22 22 -2 0 14Z" fill="#1F44C4" stroke="#0F1D3D" stroke-width="2"/></g><polyline class="ecg" points="120,96 140,96 146,82 153,110 160,88 165,96 212,96" fill="none" stroke="#1F44C4" stroke-width="3" stroke-linejoin="round"/>';
const CONF = '<g class="conf">' + Array.from({ length:14 }, (_, i) => `<rect x="${12 + i * 14}" y="${(i * 37) % 60}" width="6" height="10" rx="1.5" fill="${['#1F44C4','#C3CBD8','#0F1D3D','#6F8DEB'][i % 4]}" style="animation-delay:${(i * .17).toFixed(2)}s;transform-box:fill-box"/>`).join('') + '</g>';
const SCENES = {
  welcome:{ f:[GUARD, PZ['1'], GUARD, PZ['2'], GUARD, GUARD_DIP, GUARD_UP], seg:260, hold:160 },
  about:{ f:[P({}), P({ a1:[12,8], a2:[-8,8] })], seg:1200, hold:500, deco:RULER },
  health:{ f:MOVES.breathe.f, seg:2200, hold:400, deco:HEART },
  exp:{ f:EX.goblet.f, seg:1300, hold:300 },
  celebrate:{ f:[CEL1, CEL2], seg:380, hold:80, deco:CONF },
  fight:{ f:[GUARD, PZ['1'], GUARD, PZ['2'], GUARD, PZ['3'], GUARD], seg:260, hold:160 },
  rest:{ f:MOVES.breathe.f, seg:2600, hold:500 }
};
function calSVG(days) {
  return `<svg class="art" viewBox="0 0 280 92" role="img" aria-label="${tt('Your training days','Hari latihanmu')}">` + DOW.map((d, i) => {
    const x = 6 + i * 39.4, on = days.includes(d);
    return `<rect x="${x}" y="8" width="34" height="78" rx="9" fill="${on ? '#1F44C4' : 'none'}" stroke="currentColor" stroke-opacity="${on ? 0 : .3}" stroke-width="1.5"/>
      <text x="${x + 17}" y="27" text-anchor="middle" class="${on ? 'tOn' : ''}">${dayShort(d)}</text>
      ${on ? `<g transform="translate(${x + 6} 38) scale(.92)" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${IP.glove}</g>` : `<circle cx="${x + 17}" cy="60" r="3" fill="currentColor" opacity=".3"/>`}`;
  }).join('') + '</svg>';
}
function dbArt(min, max) {
  const one = (x, kg) => { const r = clamp(10 + kg * .9, 11, 34);
    return `<g transform="translate(${x} 60)"><rect x="-34" y="-4" width="68" height="8" rx="3" fill="#B9C2D0" stroke="#14203A" stroke-width="2"/>
      <rect x="-34" y="${-r}" width="14" height="${r * 2}" rx="4" fill="#4A5675" stroke="#14203A" stroke-width="2"/><rect x="20" y="${-r}" width="14" height="${r * 2}" rx="4" fill="#4A5675" stroke="#14203A" stroke-width="2"/>
      <text y="${r + 18}" text-anchor="middle">${kg || '?'} kg</text></g>`; };
  return `<svg class="art" viewBox="0 0 280 120" role="img" aria-label="${tt('Your dumbbells','Dumbbell kamu')}">${one(70, min)}${one(200, max)}</svg>`;
}
const goalScene = g => ({ fat:{ f:MOVES.jacks.f, seg:320, hold:80 }, muscle:{ f:EX.curl.f, seg:1200, hold:250 }, fight:SCENES.fight,
  learn:{ f:MOVES.stance.f, seg:550, hold:450 }, health:{ f:MOVES.sidereach.f, seg:1000, hold:400 } }[g] || SCENES.welcome);

/* Mount animated figures inside any container */
const FIGMAP = new Map();
const io = 'IntersectionObserver' in window ? new IntersectionObserver(ents => ents.forEach(en => {
  const a = FIGMAP.get(en.target); if (!a) return;
  if (en.isIntersecting) play(a); else stopAnim(a);
}), { rootMargin:'120px' }) : null;
function framesFor(kind, id) {
  if (kind === 'punch') return { f:[GUARD, PZ[id], GUARD, GUARD_DIP], seg:330, hold:420 };
  if (kind === 'ex') return { f:EX[id].f, seg:EX[id].tempo / 2 - 150, hold:300 };
  if (kind === 'scene') return SCENES[id];
  if (kind === 'goal') return goalScene(id);
  const m = MOVES[id]; return { f:m.f, seg:m.seg, hold:m.hold };
}
function mountFigs(root) {
  FIGMAP.forEach((a, el) => { if (!el.isConnected) { stopAnim(a); if (io) io.unobserve(el); FIGMAP.delete(el); } });
  root.querySelectorAll('[data-fig]').forEach(el => {
    if (FIGMAP.has(el) || el.classList.contains('has-vid')) return;
    if (VIDMAP[el.dataset.fig] && el.closest('#v-workouts')) { mountVideo(el, el.dataset.fig); return; }
    const [kind, id] = el.dataset.fig.split(':'), fr = framesFor(kind, id);
    const a = new Anim(makeFig(el, el.dataset.label || '', fr.deco, kind + ':' + id, el.hasAttribute('data-glow')), fr.f, fr.seg, fr.hold, true);
    FIGMAP.set(el, a); if (io) io.observe(el); else play(a);
  });
}
const figHost = (kind, id, label, cls, glow) => `<div class="figbox ${cls || ''}" data-fig="${kind}:${id}" data-label="${esc(label || '')}"${glow ? ' data-glow' : ''}></div>`;

/* =========================================================
   Coach lines
   ========================================================= */
const COACH = {
  calm: { warm:[['Easy pace. Just get warm.','Nice and loose.','Breathe and keep moving.'],['Santai saja. Yang penting badan hangat.','Rileks dan lentur.','Tarik napas dan terus bergerak.']],
    set:[['Nice and controlled.','Smooth and steady.','Good form first.'],['Pelan dan terkontrol.','Stabil dan halus.','Teknik dulu.']],
    push:[['Two more, nice and smooth.','Almost there.','Stay with it.'],['Dua lagi, tetap rapi.','Hampir selesai.','Tahan sebentar lagi.']],
    done:[['Nice set.','Well done.','Good work.'],['Set yang bagus.','Bagus sekali.','Kerja bagus.']],
    round:[['Hands up, stay light.','Good rhythm.','Relax your shoulders.','Breathe out with every punch.'],['Tangan naik, tetap ringan.','Ritmenya bagus.','Bahu rileks.','Buang napas di setiap pukulan.']],
    late:[['Thirty seconds. Stay relaxed.'],['Tiga puluh detik. Tetap rileks.']],
    rest:[['Breathe. Shake it out.','Good. Recover.'],['Tarik napas. Goyangkan badan.','Bagus. Pulihkan dulu.']],
    hold:[['Breathe slowly.','Stay strong.'],['Napas pelan-pelan.','Tetap kuat.']] },
  steady: { warm:[['Good, keep moving.','Loosen up, nice.','Get that body ready, {name}.'],['Bagus, terus bergerak.','Lemaskan badan, mantap.','Siapkan badanmu, {name}.']],
    set:[['Let’s go, {name}.','Focus. Good reps.','Here we go.'],['Ayo, {name}.','Fokus. Repetisi yang bagus.','Kita mulai.']],
    push:[['Two more! Keep it clean.','Come on, almost done!','Push through!'],['Dua lagi! Tetap rapi!','Ayo, hampir selesai!','Terus dorong!']],
    done:[['Great set!','That’s how it’s done.','Strong!'],['Set yang hebat!','Begitu caranya.','Kuat!']],
    round:[['Hands back to your face!','Move your feet!','Snap those punches!','Chin down, eyes up!'],['Tangan kembali ke wajah!','Gerakkan kakimu!','Pukulan yang tajam!','Dagu turun, mata ke depan!']],
    late:[['Thirty seconds! Pick up the pace!'],['Tiga puluh detik! Naikkan tempo!']],
    rest:[['Good work. Breathe.','Recover, the next one’s coming.'],['Kerja bagus. Tarik napas.','Pulihkan, berikutnya segera.']],
    hold:[['Hold it! You’ve got this.','Stay tight!'],['Tahan! Kamu bisa!','Tetap kencang!']] },
  hard: { warm:[['Get that blood moving!','Wake those muscles up, {name}!','Warm up properly. We go hard after this.'],['Ayo panaskan badan!','Bangunkan ototmu, {name}!','Pemanasan yang benar. Setelah ini kita gas.']],
    set:[['Time to work, {name}!','No easy reps today!','Let’s get it!'],['Waktunya kerja, {name}!','Hari ini tidak ada repetisi gampang!','Ayo kita hajar!']],
    push:[['Two more! Don’t you quit!','Dig deep, {name}!','This is where you get better!','Push! Push!'],['Dua lagi! Jangan menyerah!','Gali lebih dalam, {name}!','Di sinilah kamu jadi lebih baik!','Dorong! Dorong!']],
    done:[['That’s what I want to see!','You earned that one!','Great set!'],['Itu yang mau saya lihat!','Kamu pantas dapat itu!','Set yang hebat!']],
    round:[['Faster hands!','Don’t drop that guard!','Move! Move!','Sit down on your punches!','Keep throwing!'],['Tangan lebih cepat!','Jangan turunkan guard!','Gerak! Gerak!','Tanam kakimu di setiap pukulan!','Terus pukul!']],
    late:[['Thirty seconds! Empty the tank!'],['Tiga puluh detik! Habiskan tenagamu!']],
    rest:[['Breathe. You’re going again soon.','Shake it out. The next one’s harder.'],['Tarik napas. Sebentar lagi lanjut.','Goyangkan badan. Berikutnya lebih berat.']],
    hold:[['Hold it! Don’t you dare drop!','Ten more seconds of grit!'],['Tahan! Jangan sampai jatuh!','Sepuluh detik lagi, kuatkan mental!']] }
};
function line(cat) {
  const p = PROF || {}, lvl = (S && S.ses && S.ses.gentle) ? 'calm' : (isMinor(p) && p.push === 'hard' ? 'steady' : (p.push || 'steady'));
  let t = pick(L(COACH[lvl][cat]));
  if ((cat === 'push' || cat === 'late') && p.why && Math.random() < .25) t = tt('Remember why you started. ', 'Ingat kenapa kamu mulai. ') + p.why;
  return t.replace(/\{name\}/g, p.name || tt('champ', 'jagoan'));
}
