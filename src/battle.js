// ---- groups, stats and moves ----
// Every creature belongs to a realm (its egg), an element and a kind. Its move pool is its own unique move
// plus the shared moves of those three groups; the player picks up to four to take into battle.
const ELN={fire:"Fire",water:"Water",lightning:"Lightning",wind:"Wind",earth:"Earth",light:"Light",shadow:"Shadow",none:"Neutral",random:"Any element"};
const ELC={fire:"#ff8a4d",water:"#5dc8ff",lightning:"#ffe45c",wind:"#bfeee0",earth:"#a5c46a",light:"#ffe9a8",shadow:"#c77dff",none:"#cfc8d8",random:"#ffffff"};
const KINDN={beast:"Beast",bird:"Bird",aquatic:"Aquatic",crawler:"Crawler",serpent:"Serpent",spirit:"Spirit"};
const REALMN={fused:"Fused",hearth:"Primal",sanctum:"Sanctum",void:"Void"};
const NAT=["water","fire","wind","earth","lightning"];
// natural loop: each element is strong against the next one
const BEATS={water:"fire",fire:"wind",wind:"earth",earth:"lightning",lightning:"water"};
// Light and Shadow are glass cannons: their moves hit everything harder, and they take more from everything
const GLASS=1.5;
function typeMult(el,tEl){let m=1;if(BEATS[el]===tEl)m=1.5;else if(BEATS[tEl]===el)m=.67;if(el==="light"||el==="shadow")m*=GLASS;if(tEl==="light"||tEl==="shadow")m*=GLASS;return m}
const ELM={
  fire:[{n:"Ember",pow:1,stc:.35},{n:"Kindle",pow:.5,stc:1,cd:2},{n:"Inferno",pow:2.4,charge:1,cd:3}],
  water:[{n:"Splash",pow:1,stc:.35},{n:"Drench",pow:.5,stc:1,cd:2},{n:"Tsunami",pow:2.4,charge:1,cd:3},{n:"Tidal Mend",heal:.3,cd:3}],
  lightning:[{n:"Spark",pow:1,stc:.35},{n:"Static Field",pow:.5,stc:1,cd:2},{n:"Thunderstorm",pow:2.4,charge:1,cd:3},{n:"Thunderbolt",pow:1.4,stun:.3,cd:2}],
  wind:[{n:"Gust",pow:.9,pri:1,stc:.35},{n:"Buffet",pow:.5,stc:1,cd:2},{n:"Cyclone",pow:2.4,charge:1,cd:3},{n:"Tailwind",sSpd:1.5,sAtk:1.2,cd:3}],
  earth:[{n:"Rockfall",pow:1.1,stc:.35},{n:"Entangle",pow:.5,stc:1,cd:2},{n:"Earthquake",pow:2.4,charge:1,cd:3},{n:"Stone Skin",sDef:1.6,cd:3}],
  light:[{n:"Radiance",pow:1,stc:.35},{n:"Flash",pow:.5,stc:1,cd:2},{n:"Judgment",pow:2.4,charge:1,cd:3}],
  shadow:[{n:"Shade",pow:1,stc:.35},{n:"Hex Mark",pow:.5,stc:1,cd:2},{n:"Eclipse",pow:2.4,charge:1,cd:3}],
  none:[{n:"Pulse",pow:1},{n:"Overclock",sAtk:1.3,sSpd:1.3,cd:3}]
};
// ---- elemental statuses and the combos that cash them in ----
// Each element leaves a status; a different element hits that status for +60% and clears it.
// The combo chain runs: Water soaks -> Lightning, Lightning shocks -> Earth, Earth roots -> Fire, Fire burns -> Wind,
// Wind knocks off balance -> Water. Light blinds -> Shadow, Shadow curses -> Light.
const ST={burn:{i:"🔥",n:"Burning",t:3},soak:{i:"💧",n:"Soaked",t:4},shock:{i:"⚡",n:"Shocked",t:3},root:{i:"🌿",n:"Rooted",t:3},
  scatter:{i:"🌀",n:"Off-balance",t:3},blind:{i:"👁️",n:"Blinded",t:3},curse:{i:"💀",n:"Cursed",t:4}};
const ST_VERB={burn:"burn",soak:"soak",shock:"shock",root:"root",scatter:"knock off balance",blind:"blind",curse:"curse"};
const EL_ST={fire:"burn",water:"soak",lightning:"shock",earth:"root",wind:"scatter",light:"blind",shadow:"curse"};
const COMBO={lightning:["soak","Conducted!"],earth:["shock","Grounded!"],fire:["root","Kindled!"],wind:["burn","Fanned!"],water:["scatter","Swept away!"],shadow:["blind","Engulfed!"],light:["curse","Purged!"]};
const COMBO_MULT=1.6;
const BRACE={n:"Brace",el:"none",brace:.35,pri:2,cd:1};
function role(x){if(x.brace||x.shield)return"Guard";if(x.charge)return"Charge";if(x.heal&&!x.pow)return"Heal";
  if(x.stc===1||((x.stun||x.tAtk||x.tDef||x.tSpd)&&(x.pow||0)<.8))return"Setup";if((x.sAtk||x.sDef||x.sSpd)&&!x.pow)return"Boost";return"Strike"}
// which way each picture faces; yours always faces right and the enemy faces left
const FACE_R=new Set(["bell-crane","grave-hound","grovewarden","seraph-moth","tide-otter","undertow"]);
const FACE_C=new Set(["equinox","gale-kestrel","gloam-moth","halo-medusa","lantern-jelly","lumen","moon-hare","riftborn","the-watcher","thunderbird","tsuchigumo","vigil-owl"]);
const flipOf=u=>{if(!u||u.isEgg||FACE_C.has(u.id))return 1;const f=FACE_R.has(u.id)?"R":"L";return f===(u.side==="you"?"R":"L")?1:-1};

const KM={
  beast:[{n:"Bite",pow:1.1},{n:"Roar",tAtk:.7,cd:2}],
  bird:[{n:"Dive",pow:1,pri:1},{n:"Wing Guard",shield:1,cd:3}],
  aquatic:[{n:"Slipstream",pow:.8,sSpd:1.5},{n:"Brine",pow:.6,tDef:.7,cd:1}],
  crawler:[{n:"Venom",pow:.7,dot:1,cd:1},{n:"Web",pow:.6,tSpd:.5,cd:1}],
  serpent:[{n:"Constrict",pow:.9,stun:.25,cd:1},{n:"Coil",sDef:1.6,cd:3}],
  spirit:[{n:"Hex",pow:.6,tDef:.7,cd:1},{n:"Spirit Mend",heal:.25,cd:3}]
};
const RM={fused:{n:"Twin Bond",heal:.25,sAtk:1.2,cd:3},hearth:{n:"Wild Surge",sAtk:1.4,cd:3},sanctum:{n:"Blessing",heal:.2,cleanse:1,cd:3},void:{n:"Drain",pow:.9,drain:.5,cd:1}};
// w = [health, attack, defense] weights on the creature's base power; spd is its own number; u = its unique move
const META={
  "ashroot-boar":{el:"fire",kind:"beast",w:[1.2,1.1,1],spd:40,u:{n:"Ashen Charge",pow:1.5,cd:2}},
  "storm-hare":{el:"lightning",kind:"beast",w:[.8,1,.7],spd:95,u:{n:"Static Dash",pow:.9,pri:1,stun:.2}},
  "tide-otter":{el:"water",kind:"aquatic",w:[1,1,.9],spd:70,u:{n:"Current Snap",pow:1.1,tSpd:.6,cd:1}},
  "gale-kestrel":{el:"wind",kind:"bird",w:[.7,1.2,.6],spd:100,u:{n:"Hover Strike",pow:1.2,crit:.5,cd:1}},
  "burrow-badger":{el:"earth",kind:"beast",w:[1.2,1,1.3],spd:30,u:{n:"Dig In",sDef:1.5,heal:.15,cd:3}},
  "kiln-salamander":{el:"fire",kind:"aquatic",w:[1.1,1.1,1],spd:45,u:{n:"Banked Coals",pow:1,dot:1,cd:1}},
  "mossback-stag":{el:"earth",kind:"beast",w:[1.4,.9,1.2],spd:50,u:{n:"Grove's Gift",heal:.35,cd:3}},
  "thunder-ox":{el:"lightning",kind:"beast",w:[1.3,1.3,1],spd:35,u:{n:"Stormcharge",pow:1.6,cd:2}},
  "ninetail-fox":{el:"fire",kind:"spirit",w:[.9,1.2,.9],spd:85,u:{n:"Nine Tails",pow:.5,hits:3,el:"random",cd:1}},
  "dragon-carp":{el:"water",kind:"aquatic",w:[1.1,1.1,1],spd:60,u:{n:"Waterfall Ascent",pow:1.2,sAtk:1.3,cd:2}},
  "tanuki-elder":{el:"earth",kind:"spirit",w:[1.3,.9,1.1],spd:40,u:{n:"Leaf Trick",pow:1,tAtk:.7,sDef:1.3,cd:2}},
  "sun-hornet":{el:"lightning",kind:"crawler",w:[.7,1.3,.7],spd:95,u:{n:"Paralyzing Sting",pow:1,stun:.6,cd:2}},
  "thunderbird":{el:"lightning",kind:"bird",w:[1,1.3,.9],spd:80,u:{n:"Thunderclap",pow:1.5,stun:.3,cd:2}},
  "world-tortoise":{el:"earth",kind:"spirit",w:[1.8,.8,1.8],spd:10,u:{n:"World Shell",sDef:2,heal:.2,cd:3}},
  "beacon-stag":{el:"light",kind:"beast",w:[1,1,1],spd:60,u:{n:"Signal Flare",pow:1,tDef:.7,cd:1}},
  "bell-crane":{el:"wind",kind:"bird",w:[.9,1,.8],spd:75,u:{n:"Bell Call",pow:.8,stun:.4,cd:2}},
  "lantern-ram":{el:"light",kind:"beast",w:[1.1,1.1,1.1],spd:45,u:{n:"Lantern Charge",pow:1.4,cd:2}},
  "vigil-owl":{el:"light",kind:"bird",w:[1,1,1],spd:70,u:{n:"Vigil",shield:1,sAtk:1.3,cd:3}},
  "sun-lion":{el:"light",kind:"beast",w:[1.2,1.2,1.1],spd:55,u:{n:"Guardian's Roar",sAtk:1.5,tAtk:.8,cd:3}},
  "moon-hare":{el:"light",kind:"spirit",w:[.9,1,.9],spd:90,u:{n:"Moonlight",heal:.3,cleanse:1,cd:3}},
  "ivory-elephant":{el:"earth",kind:"beast",w:[1.6,1,1.4],spd:25,u:{n:"Temple March",pow:1.3,sDef:1.3,cd:2}},
  "radiant-qilin":{el:"light",kind:"spirit",w:[1.1,1.3,1],spd:85,u:{n:"Heaven's Stride",pow:1.6,pri:1,cd:2}},
  "whisper-jackal":{el:"shadow",kind:"beast",w:[.9,1.1,.9],spd:80,u:{n:"Pack Signal",pow:.9,pack:1}},
  "hollow-raven":{el:"shadow",kind:"bird",w:[.8,1.1,.8],spd:85,u:{n:"Omen",pow:.8,tDef:.7,cd:1}},
  "drift-eel":{el:"water",kind:"aquatic",w:[1.1,1,1],spd:50,u:{n:"Lure",pow:1,drain:.5,cd:1}},
  "gloam-moth":{el:"shadow",kind:"crawler",w:[.9,1,.9],spd:65,u:{n:"Staring Wings",pow:.6,tAtk:.7,tSpd:.7,cd:2}},
  "night-serpent":{el:"shadow",kind:"serpent",w:[1,1.3,1],spd:70,u:{n:"Eclipse Strike",pow:1.5,crit:.3,cd:2}},
  "grave-hound":{el:"shadow",kind:"beast",w:[1.2,1.2,1],spd:60,u:{n:"Grave Bite",pow:1.2,drain:.5,cd:1}},
  "tsuchigumo":{el:"earth",kind:"crawler",w:[1.3,1.1,1.2],spd:45,u:{n:"Cocoon",pow:1.1,tSpd:.5,dot:1,cd:2}},
  "ashen-phoenix":{el:"fire",kind:"bird",w:[1.1,1.2,.9],spd:80,u:{n:"Rekindle",heal:.35,sAtk:1.3,cd:3}},
  "undertow":{el:"water",kind:"spirit",w:[1.3,1.1,1],spd:55,u:{n:"Drag Under",pow:1.2,tSpd:.5,drain:.3,cd:2}},
  "squall":{el:"wind",kind:"spirit",w:[.8,1.3,.8],spd:100,u:{n:"Cutting Gale",pow:.6,hits:3,pri:1,cd:2}},
  "cinderheart":{el:"fire",kind:"spirit",w:[1.4,1.3,1.2],spd:25,u:{n:"Eruption",pow:1.7,dot:1,cd:3}},
  "tempest":{el:"lightning",kind:"spirit",w:[1,1.4,.9],spd:75,u:{n:"Chain Lightning",pow:.7,hits:3,stun:.2,cd:2}},
  "grovewarden":{el:"earth",kind:"spirit",w:[1.6,1,1.5],spd:20,u:{n:"Overgrowth",heal:.3,sDef:1.4,cd:3}},
  "relic-wolf":{el:"none",kind:"beast",w:[1.1,1.2,1.2],spd:70,u:{n:"Signal Pulse",pow:1.1,tDef:.7,stun:.25,cd:2}},
  "pale-hart":{el:"light",kind:"beast",w:[1,1.3,1],spd:80,u:{n:"Crescent Gore",pow:1.5,crit:.3,cd:2}},
  "lumen":{el:"light",kind:"spirit",w:[.9,1.4,.9],spd:70,u:{n:"Sunburst",pow:1.3,tAtk:.7,cd:2}},
  "seraph-moth":{el:"wind",kind:"crawler",w:[1,1.1,1],spd:85,u:{n:"Gilded Dust",pow:.8,tSpd:.6,tAtk:.8,cd:2}},
  "the-watcher":{el:"shadow",kind:"spirit",w:[1.2,1.2,1.1],spd:50,u:{n:"Thousand Eyes",pow:1.2,tDef:.6,cd:2}},
  "riftborn":{el:"shadow",kind:"spirit",w:[.9,1.5,.8],spd:65,u:{n:"Collapse",pow:1.8,cd:3}},
  "dusk-moth":{el:"shadow",kind:"crawler",w:[1.4,1,1.4],spd:35,u:{n:"Smother",pow:1,tSpd:.5,drain:.3,cd:2}},
  "equinox":{el:"light",el2:"shadow",kind:"crawler",w:[1.2,1.4,1.1],spd:80,u:{n:"Day and Night",pow:.9,hits:2,els:["light","shadow"],cd:2}},
  "first-storm":{el:"earth",kind:"spirit",w:[1.5,1.3,1.3],spd:45,u:{n:"Wrath of the Cradle",pow:.5,hits:5,els:["water","wind","fire","lightning","earth"],cd:3}},
  "obsidian-crow":{el:"fire",kind:"bird",w:[.9,1.1,.8],spd:75,u:{n:"Glass Peck",pow:1,crit:.3,cd:1}},
  "magma-rook":{el:"fire",kind:"bird",w:[1,1.25,.9],spd:80,u:{n:"Molten Talons",pow:1.2,dot:1,crit:.2,cd:2}},
  "drill-grub":{el:"earth",kind:"crawler",w:[1.1,1,1.3],spd:25,u:{n:"Bore",pow:1,tDef:.7,cd:1}},
  "magma-borer":{el:"earth",kind:"crawler",w:[1.2,1.2,1.4],spd:30,u:{n:"Core Drill",pow:1.4,tDef:.6,cd:2}},
  "cinder-moth":{el:"fire",kind:"crawler",w:[.9,1.1,.8],spd:70,u:{n:"Ember Dust",pow:.7,dot:1,cd:1}},
  "pyre-moth":{el:"fire",kind:"crawler",w:[1,1.25,.9],spd:75,u:{n:"Pyre Wings",pow:.6,hits:2,dot:1,cd:2}},
  "mire-toad":{el:"water",kind:"aquatic",w:[1.3,.9,1.1],spd:30,u:{n:"Slime Spit",pow:.8,tSpd:.6,cd:1}},
  "bogmaw":{el:"water",kind:"aquatic",w:[1.4,1.1,1.2],spd:35,u:{n:"Swallow",pow:1.4,drain:.3,tSpd:.6,cd:2}},
  "lantern-jelly":{el:"light",kind:"aquatic",w:[1,1,.9],spd:50,u:{n:"Sting of Light",pow:.8,stun:.3,cd:1}},
  "halo-medusa":{el:"light",kind:"aquatic",w:[1.1,1.2,1],spd:55,u:{n:"Radiant Veil",pow:1,stun:.35,shield:1,cd:3}},
  "gloom-tick":{el:"shadow",kind:"crawler",w:[1.3,.9,1.2],spd:30,u:{n:"Latch",pow:.8,drain:.5,cd:1}},
  "rift-tick":{el:"shadow",kind:"crawler",w:[1.4,1.1,1.3],spd:35,u:{n:"Engorge",pow:1.1,drain:.6,sDef:1.3,cd:2}},
  "kamaitachi":{el:"wind",kind:"beast",w:[.8,1.2,.7],spd:95,u:{n:"Sickle Wind",pow:1,crit:.3,cd:1}},
  "zawbaa":{el:"wind",kind:"serpent",w:[1.1,1,1.1],spd:60,u:{n:"Dust Devil",pow:.9,tSpd:.6,cd:1}},
  "sky-siphonophore":{el:"wind",kind:"aquatic",w:[1.1,.9,.9],spd:55,u:{n:"Drifting Sting",pow:.7,dot:1,stun:.2,cd:1}},
  "ichimokuren":{el:"wind",kind:"serpent",w:[1,1.25,.9],spd:90,u:{n:"Eye of the Storm",pow:1.3,crit:.35,cd:2}},
  "hraesvelgr":{el:"wind",kind:"bird",w:[1.2,1.3,1],spd:85,u:{n:"Corpse-Wind",pow:1.6,tDef:.7,cd:2}},
  "choir-starlings":{el:"light",kind:"bird",w:[1,1.1,.9],spd:80,u:{n:"One Note",pow:.45,hits:3,cd:1}},
  "lamassu":{el:"light",kind:"beast",w:[1.5,1,1.4],spd:30,u:{n:"Gate Ward",shield:1,sDef:1.4,cd:3}},
  "ophanim":{el:"light",kind:"spirit",w:[1.2,1.3,1.1],spd:70,u:{n:"Wheel of Eyes",pow:.6,hits:3,stun:.2,cd:2}},
  "fig-lurker":{el:"shadow",kind:"aquatic",w:[1.1,1,1],spd:40,u:{n:"Suction Grip",pow:.8,tSpd:.6,cd:1}},
  "yara-ma-yha-who":{el:"shadow",kind:"spirit",w:[1.15,1.1,1],spd:50,u:{n:"Swallow Whole",pow:1.2,drain:.4,cd:2}},
  "ahuizotl":{el:"shadow",kind:"aquatic",w:[1.1,1.25,1],spd:75,u:{n:"Drowning Grasp",pow:1.2,tSpd:.6,cd:1}},
  "taotie":{el:"shadow",kind:"beast",w:[1.4,1.35,1.1],spd:40,u:{n:"Devouring Maw",pow:1.7,drain:.25,cd:2}},
  "mandrake-homunculus":{el:"earth",kind:"spirit",w:[1.1,1.2,1],spd:55,u:{n:"Mandrake Scream",pow:1.1,stun:.35,cd:2}},
  "toll-keeper":{el:"light",kind:"spirit",w:[1.4,1.3,1.3],spd:45,u:{n:"Equivalent Exchange",pow:1.7,drain:.5,cd:2}},
  "green-mother":{el:"earth",kind:"beast",w:[1.6,1.1,1.3],spd:45,u:{n:"Bloom of Ages",pow:1.3,heal:.25,cd:2}},
  "pale-shepherd":{el:"shadow",kind:"spirit",w:[1.3,1.4,1],spd:55,u:{n:"Gather the Flock",pow:.55,hits:4,drain:.3,cd:3}},
  "ash-nymph":{el:"fire",kind:"crawler",w:[1.2,1,1.2],spd:35,u:{n:"Cinder Burrow",pow:.9,sDef:1.2,cd:1}},
  "pyre-cicada":{el:"fire",kind:"crawler",w:[1,1.2,.9],spd:70,u:{n:"Searing Song",pow:1.1,tDef:.7,cd:2}},
  "pale-axolotl":{el:"water",kind:"aquatic",w:[1.2,.9,1],spd:45,u:{n:"Regrow",heal:.3,cd:3}},
  "ningen-calf":{el:"water",kind:"aquatic",w:[1.25,1,1],spd:45,u:{n:"Pale Grasp",pow:1,tSpd:.6,cd:1}},
  "ningen":{el:"water",kind:"aquatic",w:[1.4,1.15,1.05],spd:50,u:{n:"Abyssal Stare",pow:1.4,stun:.3,cd:2}},
  "thunder-mantis-shrimp":{el:"lightning",kind:"aquatic",w:[.9,1.25,1],spd:75,u:{n:"Cavitation Punch",pow:1.2,pri:1,cd:2}},
  "raiko-smasher":{el:"lightning",kind:"aquatic",w:[1,1.35,1.1],spd:70,u:{n:"Thunder Fist",pow:1.6,stun:.25,cd:2}},
  "pill-armadillo":{el:"earth",kind:"beast",w:[1.1,.9,1.4],spd:35,u:{n:"Roll Up",sDef:1.6,shield:1,cd:3}},
  "glyptodon":{el:"earth",kind:"beast",w:[1.3,1,1.5],spd:25,u:{n:"Tail Club",pow:1.4,stun:.25,cd:2}},
  "orchid-nymph":{el:"light",kind:"crawler",w:[.9,1.1,.9],spd:70,u:{n:"Petal Lure",pow:.8,tAtk:.7,cd:1}},
  "orchid-mantis":{el:"light",kind:"crawler",w:[1,1.2,.9],spd:80,u:{n:"Praying Strike",pow:1.1,crit:.3,cd:1}},
  "cathedral-mantis":{el:"light",kind:"crawler",w:[1,1.3,1],spd:85,u:{n:"Vesper Scythes",pow:.6,hits:3,cd:2}},
  "night-aye-aye":{el:"shadow",kind:"beast",w:[.9,1.1,.9],spd:80,u:{n:"The Long Finger",pow:.8,tDef:.7,cd:1}},
  "hollow-finger":{el:"shadow",kind:"beast",w:[1,1.25,.9],spd:85,u:{n:"Death Point",pow:1.4,crit:.25,cd:2}},
  "spark-shrimp":{el:"lightning",kind:"aquatic",w:[.85,1.2,.9],spd:80,u:{n:"Jab",pow:.9,pri:1,cd:1}},
  "mire-naiad":{el:"wind",kind:"crawler",w:[1.1,1,1.1],spd:45,u:{n:"Snap Jaw",pow:1,crit:.2,cd:1}},
  "gale-darter":{el:"wind",kind:"crawler",w:[.9,1.15,.8],spd:100,u:{n:"Darting Strike",pow:1,pri:1,cd:1}},
  "meganeura":{el:"wind",kind:"crawler",w:[1,1.3,.9],spd:105,u:{n:"Primeval Gale",pow:1.5,tDef:.75,cd:2}},
  "blank-mask":{el:"none",kind:"spirit",w:[1,1,1],spd:60,u:{n:"Mimic",pow:.9,el:"random",cd:1}},
  "hannya-mask":{el:"fire",kind:"spirit",w:[1,1.3,.9],spd:75,u:{n:"Demon Fire",pow:1.4,dot:1,cd:2}},
  "tide-mask":{el:"water",kind:"spirit",w:[1.2,1.1,1.1],spd:55,u:{n:"Mourning Tide",pow:1.2,tSpd:.6,cd:2}},
  "thunder-mask":{el:"lightning",kind:"spirit",w:[1,1.25,1],spd:70,u:{n:"Thunder Axe",pow:1.4,stun:.3,cd:2}},
  "garuda-mask":{el:"wind",kind:"spirit",w:[1,1.2,.9],spd:95,u:{n:"Herald's Dive",pow:1.3,pri:1,cd:2}},
  "stone-mask":{el:"earth",kind:"spirit",w:[1.4,1,1.4],spd:30,u:{n:"Colossus",pow:1.3,sDef:1.3,cd:2}},
  "saint-mask":{el:"light",kind:"spirit",w:[1.2,1.1,1.1],spd:60,u:{n:"Benediction",pow:.9,heal:.3,cd:2}},
  "plague-mask":{el:"shadow",kind:"spirit",w:[1.1,1.3,1],spd:65,u:{n:"Miasma",pow:.8,dot:1,drain:.3,cd:2}},
  "thousand-face-mask":{el:"none",kind:"spirit",w:[1.35,1.3,1.25],spd:75,u:{n:"Every Face",pow:.32,hits:7,els:["fire","water","lightning","wind","earth","light","shadow"],cd:3}},
  "star-eater-whale":{el:"shadow",kind:"aquatic",w:[1.5,1.3,1.1],spd:30,u:{n:"Devour",pow:1.8,drain:.3,cd:3}}
};
// ---- battle passives ----
// Creatures without a hatchery ability get a battle passive. Commons and uncommons share one by kind;
// rares and above have their own, still in the spirit of their kind and element. A passive works while
// the creature is fighting (in boss fights your whole team is fighting), and grows with stars.
const cap=(a,b,c)=>s=>Math.min(c,a+3*b*(s-1)); // passives grow with stars
const KINDP={
  beast:{k:"ferocity",n:"Ferocity",val:cap(.2,.01,.4),text:v=>`Deals +${pct(v)} damage while below half health.`},
  bird:{k:"evasive",n:"Evasive",val:cap(.04,.004,.12),text:v=>`Dodges the first hit each fight, then has a ${pct(v)} chance to dodge any hit.`},
  aquatic:{k:"tidal",n:"Tidal Recovery",val:cap(.04,.002,.08),text:v=>`Heals ${pct(v)} of its health at the end of each turn.`},
  crawler:{k:"venomous",n:"Venomous",val:cap(.3,.01,.5),text:v=>`${pct(v)} chance to poison anything that hits it.`},
  serpent:{k:"coldcoil",n:"Cold Coil",val:cap(.3,.01,.5),text:v=>`${pct(v)} chance to slow anything that hits it.`},
  spirit:{k:"unbound",n:"Unbound",val:cap(.4,.015,.75),text:v=>`${pct(v)} chance to shrug off stuns, poison and stat drops.`}
};
const UNIQUE={
  // ---- Primal ----
  "tanuki-elder":{k:"illusion",n:"Illusion",val:cap(.15,.005,.3),text:v=>`${pct(v)} chance that an enemy attack hits an illusion instead.`},
  "ningen":{k:"lowdr",n:"Unseen Depths",val:cap(.25,.008,.45),text:v=>`Below half health, it slips into the deep and takes ${pct(v)} less damage.`},
  "sun-hornet":{k:"staticvenom",n:"Static Venom",val:cap(.2,.005,.35),text:v=>`Its damaging moves have a ${pct(v)} chance to stun.`},
  "mandrake-homunculus":{k:"deathcry",n:"Death Shriek",val:cap(1,0,1),text:v=>`When it is knocked out, its scream stuns whatever did it.`},
  "ichimokuren":{k:"moonlit",n:"Storm Eye",val:cap(.15,.005,.3),text:v=>`+${pct(v)} crit chance on every hit.`},
  "raiko-smasher":{k:"shockhit",n:"Live Wire",val:cap(.25,.008,.45),text:v=>`Its hits have a ${pct(v)} chance to leave the target Shocked.`},
  "meganeura":{k:"auraSpd",n:"First Wings",val:cap(.1,.004,.2),text:v=>`Your whole team gets +${pct(v)} Speed.`},
  "hannya-mask":{k:"burnhit",n:"Jealous Flame",val:cap(.3,.008,.5),text:v=>`Its hits have a ${pct(v)} chance to set the target Burning.`},
  "tide-mask":{k:"slowhit",n:"Sea Song",val:cap(.3,.008,.5),text:v=>`Its hits have a ${pct(v)} chance to slow the target.`},
  "thunder-mask":{k:"thundercloak",n:"Storm Crown",val:cap(.2,.005,.35),text:v=>`${pct(v)} chance to stun anything that hits it.`},
  "garuda-mask":{k:"dodge",n:"King of Birds",val:cap(.15,.005,.3),text:v=>`${pct(v)} chance to dodge any hit.`},
  "stone-mask":{k:"guard",n:"Colossal Brow",val:cap(.15,.005,.3),text:v=>`Takes ${pct(v)} less damage.`},
  "thunderbird":{k:"conductor",n:"Storm Bringer",val:cap(.3,.01,.6),text:v=>`Deals +${pct(v)} damage to Shocked or Soaked targets, without using the status up.`},
  "ashen-phoenix":{k:"rebirth",n:"Rebirth",val:cap(.3,.01,.6),text:v=>`Once per fight, rises from a knockout with ${pct(v)} health.`},
  "undertow":{k:"riptide",n:"Riptide",val:cap(.15,.005,.3),text:v=>`Heals ${pct(v)} of all damage it deals.`},
  "squall":{k:"galeforce",n:"Gale Force",val:cap(1,0,1),text:v=>`Always moves first.`},
  "cinderheart":{k:"magmacore",n:"Magma Core",val:cap(.4,.01,.7),text:v=>`${pct(v)} chance to burn anything that hits it.`},
  "tempest":{k:"overcharge",n:"Overcharge",val:cap(.08,.002,.15),text:v=>`Its Attack rises ${pct(v)} at the end of every turn, up to +50%.`},
  "hraesvelgr":{k:"shredhit",n:"Corpse-Wind",val:cap(.3,.008,.5),text:v=>`Its hits have a ${pct(v)} chance to cut the target's Defense by 20%.`},
  "grovewarden":{k:"deeproots",n:"Deep Roots",val:cap(.06,.002,.12),text:v=>`Heals ${pct(v)} of its health at the end of each turn.`},
  "relic-wolf":{k:"adaptive",n:"Adaptive Plating",val:cap(1,0,1),text:v=>`Never takes extra damage from type matchups.`},
  "world-tortoise":{k:"livingworld",n:"Living World",val:cap(.2,.005,.35),k2:"auraShield",val2:cap(1,0,1),text:v=>`Takes ${pct(v)} less damage and heals 5% of its health each turn. Your whole team starts every fight shielded from one hit.`},
  "green-mother":{k:"auraRegen",n:"Mother of Groves",val:cap(.04,.002,.08),k2:"auraDr",val2:cap(.08,.003,.15),text:(v,w)=>`Your whole team heals ${pct(v)} of its health each turn and takes ${pct(w)} less damage.`},
  "thousand-face-mask":{k:"comboAmp",n:"Worn Every Face",val:cap(.4,.01,.7),k2:"adaptive",val2:cap(1,0,1),text:v=>`Its combos hit +${pct(v)} harder, and it never takes extra damage from type matchups.`},
  // ---- Sanctum: rares and up support the whole team ----
  "sun-lion":{k:"auraAtk",n:"Pride's Roar",val:cap(.1,.004,.2),text:v=>`Your whole team gets +${pct(v)} Attack.`},
  "lamassu":{k:"auraDr",n:"Gatekeeper",val:cap(.12,.004,.22),text:v=>`Your whole team takes ${pct(v)} less damage.`},
  "cathedral-mantis":{k:"ambush",n:"Still as Prayer",val:cap(2,.05,3),text:v=>`Its first damaging hit each fight deals ${Math.round(v*100)/100}× damage.`},
  "saint-mask":{k:"purify",n:"Gilded Peace",val:cap(1,0,1),text:v=>`At the end of every turn, clears statuses and poison from your whole team.`},
  "pale-hart":{k:"blindhit",n:"Dazzling Hunt",val:cap(.3,.008,.5),text:v=>`Its hits have a ${pct(v)} chance to leave the target Blinded.`},
  "lumen":{k:"beacon",n:"Steady Flame",val:cap(.3,.01,.6),k2:"steady",val2:cap(1,0,1),text:v=>`Every heal on your team is ${pct(v)} stronger, and it doesn't take the extra damage other Light creatures take.`},
  "ophanim":{k:"grace",n:"Ever-Turning",val:cap(.05,.002,.1),text:v=>`Immune to ailments and stat drops, and heals ${pct(v)} of its health each turn.`},
  "toll-keeper":{k:"toll",n:"The Toll",val:cap(.25,.008,.45),k2:"steady",val2:cap(1,0,1),text:v=>`Everything that hits it pays: ${pct(v)} of the damage is dealt back to the attacker. Light and Shadow don't hit it extra hard.`},
  "radiant-qilin":{k:"auraGrace",n:"Heaven's Grace",val:cap(1,0,1),k2:"auraRegen",val2:cap(.03,.001,.06),text:(v,w)=>`Your whole team is immune to ailments and stat drops, and heals ${pct(w)} of its health each turn.`},
  // ---- Void: finishers that feed on weakness, darkness and the fallen ----
  "night-serpent":{k:"outspeed",n:"Cold Blood",val:cap(.3,.01,.6),text:v=>`Deals +${pct(v)} damage to targets slower than it.`},
  "grave-hound":{k:"undying",n:"Undying Hunt",val:cap(1,0,1),text:v=>`Once per fight, survives a knockout blow with 1 health.`},
  "ahuizotl":{k:"dragunder",n:"Drag Under",val:cap(.35,.01,.6),text:v=>`Deals +${pct(v)} damage to targets that are slowed or Rooted.`},
  "tsuchigumo":{k:"weblair",n:"Web Lair",val:cap(.3,.01,.5),text:v=>`When it enters a fight, the enemy's Speed drops ${pct(v)}.`},
  "taotie":{k:"devour",n:"Gluttony",val:cap(.3,.01,.5),text:v=>`Knocking out an enemy heals ${pct(v)} of its health, and each knockout makes its hits 15% stronger for the rest of the fight.`},
  "the-watcher":{k:"allseeing",n:"All-Seeing",val:cap(.1,.005,.25),text:v=>`Its hits can't be dodged or blocked, and deal +${pct(v)} damage.`},
  "riftborn":{k:"rend",n:"Rift Edge",val:cap(.3,.01,.55),text:v=>`Its hits tear through armor: they ignore ${pct(v)} of the target's Defense and deal +${pct(v/2)} damage.`},
  "plague-mask":{k:"blight",n:"Last Rites",val:cap(.3,.008,.5),text:v=>`Its hits have a ${pct(v)} chance to leave the target Cursed.`},
  "pale-shepherd":{k:"lastflock",n:"The Last Flock",val:cap(.15,.005,.25),k2:"voidhunger",val2:cap(.3,.01,.5),text:(v,w)=>`Deals +${pct(v)} damage for every fainted creature on the field, and +${pct(w)} more to targets below half health.`},
  "star-eater-whale":{k:"eclipseaura",n:"Swallow the Stars",battle:true,val:cap(.04,.002,.08),k2:"cursehunt",val2:cap(.3,.01,.5),text:(v,w)=>`At the end of every turn, the enemy loses ${pct(v)} of its health. Deals +${pct(w)} damage to Cursed or Blinded targets.`},
  // ---- fusions ----
  "equinox":{k:"balance",n:"Balance",val:cap(.15,.005,.3),text:v=>`Takes no extra damage for being Light and Shadow, and deals +${pct(v)} damage.`},
  "first-storm":{k:"primordial",n:"Primordial",val:cap(1,0,1),text:v=>`Has no weaknesses, and its hits are never resisted.`}
};
function passiveOf(m){if(typeof ABIL!=="undefined"&&ABIL[m.id]&&!(UNIQUE[m.id]&&UNIQUE[m.id].battle))return null;const M=META[m.id];if(!M)return null;return UNIQUE[m.id]?{...UNIQUE[m.id],uniq:true}:KINDP[M.kind]||null}
const P=(u,k)=>!!(u&&u.pas&&(u.pas.k===k||u.pas.k2===k));
const PV=(u,k)=>!u||!u.pas?0:u.pas.k===k?u.pv:u.pas.k2===k?u.pv2:0;
// passive values at a star level (Primal passives are stronger)
function pasVals(m,star){const p=passiveOf(m);if(!p)return[0,0];const pr=realmsOf(m).includes("hearth"),f=x=>x>=1||!pr?x:Math.min(.9,x*PRIMAL_PAS);return[f(p.val(star)),p.val2?f(p.val2(star)):0]}
function pasText(m,star){const p=passiveOf(m);if(!p)return"";const[v,w]=pasVals(m,star);return p.text(v,w)}
// team auras: the strongest living holder on that side counts, whether it's fighting or on the bench
function aura(side,k){if(!F)return 0;const L=side==="you"?F.team:F.foes;let m=0;for(const x of L)if(x&&x.hp>0&&P(x,k))m=Math.max(m,PV(x,k));return m}
const inFight=u=>F&&(F.team.includes(u)||F.foes.includes(u));
const resists=u=>P(u,"grace")||(inFight(u)&&aura(u.side,"auraGrace")>0)||(P(u,"unbound")&&Math.random()<u.pv);
function pasFx(u,txt){floatOn(u,txt||u.pas.n,"pas")}
function enter(u){if(u&&u.hp>0&&!u.once.ashield&&aura(u.side,"auraShield")){u.once.ashield=1;u.shield=Math.max(u.shield||0,1)}if(!u||u.hp<=0||!P(u,"weblair"))return;const opp=u.side==="you"?[curFoe()]:(F.boss?F.team.filter(c=>c.hp>0):[F.team[F.active]]);
  opp.forEach(o=>{if(o&&!resists(o))o.mod.spd=[1-u.pv,4]});pasFx(u)}
const grow=L=>(1+.1*(L-1))*Math.pow(2,Math.floor((L-1)/10));
function stats(m,L){const M=META[m.id],g=grow(L),B=baseOf(m);return{hp:Math.round(B*6*M.w[0]*g),atk:Math.round(B*M.w[1]*g),def:Math.round(B*M.w[2]*g),spd:Math.round(M.spd*(1+.02*(L-1)))}}
function movePool(m){
  const M=META[m.id];
  return[{id:"u",uniq:true,...M.u,el:M.u.el||M.el},...ELM[M.el].map((x,i)=>({id:"e"+i,...x,el:M.el})),...(M.el2?ELM[M.el2].map((x,i)=>({id:"f"+i,...x,el:M.el2})):[]),...KM[M.kind].map((x,i)=>({id:"k"+i,el:"none",...x})),{id:"r",el:"none",...RM[m.eggs[0]]},{id:"b",...BRACE}];
}
const DEF_LO=["u","e0","e1","b"],FOE_LO=["u","e0","e1","e2","b"],MAX_MOVES=4,STRIKE={n:"Strike",el:"none",pow:.7};
function getLoadout(id){const ok=["u","e0","e1","e2","e3","f0","f1","f2","k0","k1","r","b"],l=(loadout[id]||[]).filter(x=>ok.includes(x)).slice(0,MAX_MOVES);return l.length?l:DEF_LO.slice()}
function mvText(x){
  const p=[role(x)],P=v=>Math.round(v*100)+"%",ud=(v,s)=>(v>1?"raises ":"lowers ")+s+" "+P(Math.abs(v-1));
  if(x.pow)p.push((x.hits?x.hits+" hits, ":"")+Math.round(x.pow*100)+" power"+(x.hits?" each":""));
  if(x.charge)p.push("takes a turn to charge");if(x.brace)p.push("takes "+P(1-x.brace)+" less damage this turn");
  if(x.stc&&EL_ST[x.el])p.push((x.stc>=1?"":P(x.stc)+" chance to ")+ST_VERB[EL_ST[x.el]]);
  if(x.pri)p.push("strikes first");if(x.crit)p.push(P(x.crit)+" crit chance");
  if(x.stun)p.push(P(x.stun)+" chance to stun");if(x.dot)p.push("damage over 3 turns");
  if(x.drain)p.push("heals "+P(x.drain)+" of damage dealt");if(x.heal)p.push("heals "+P(x.heal)+" health");
  if(x.shield)p.push("blocks the next hit");if(x.cleanse)p.push("clears ailments");
  if(x.pack)p.push("stronger for each living ally");
  if(x.sAtk)p.push(ud(x.sAtk,"own Attack"));if(x.sDef)p.push(ud(x.sDef,"own Defense"));if(x.sSpd)p.push(ud(x.sSpd,"own Speed"));
  if(x.tAtk)p.push(ud(x.tAtk,"enemy Attack"));if(x.tDef)p.push(ud(x.tDef,"enemy Defense"));if(x.tSpd)p.push(ud(x.tSpd,"enemy Speed"));
  if(x.pow&&COMBO[x.el])p.push("+60% vs "+ST[COMBO[x.el][0]].n);
  if(x.cd)p.push("rests "+x.cd+" turn"+(x.cd>1?"s":""));
  return p.join(" · ");
}

// ---- regions ----
// Enemies are creatures of the region, scaled by its level. Clearing a level takes a steep number of defeats, then a boss.
// Each realm has several arenas. An arena's element shows up more often among its enemies, and its field changes the fight.
const REGION={
  hearth:{hz:0.48,name:"The Cradle",realm:"hearth",el:null,xp:15,bg:"art/bg-ar-cradle.webp",fx:"All five nature elements hit 10% harder. Elemental statuses last a turn longer."},
  ember:{hz:0.43,name:"Ember Caldera",realm:"hearth",el:"fire",xp:15,bg:"art/bg-ar-ember.webp",fx:"Fire moves hit 25% harder. Burns do double damage."},
  falls:{hz:0.55,name:"Drowned Falls",realm:"hearth",el:"water",xp:15,bg:"art/bg-ar-falls.webp",fx:"Water moves hit 25% harder. Fire moves hit 25% softer."},
  storm:{hz:0.52,name:"Stormreach",realm:"hearth",el:"lightning",xp:15,bg:"art/bg-ar-storm.webp",fx:"Lightning moves hit 25% harder. Lightning strikes a random fighter at the end of each turn."},
  gale:{hz:0.52,name:"Gale Heights",realm:"hearth",el:"wind",xp:15,bg:"art/bg-ar-gale.webp",fx:"Wind moves hit 25% harder and always go first."},
  root:{hz:0.51,name:"Rootdeep",realm:"hearth",el:"earth",xp:15,bg:"art/bg-ar-root.webp",fx:"Earth moves hit 25% harder. Everyone recovers 4% health each turn."},
  sanctum:{hz:0.46,name:"The Dawn Spires",realm:"sanctum",el:"light",xp:40,bg:"art/bg-ar-spires.webp",fx:"Light moves hit 25% harder. Healing is 50% stronger."},
  cloister:{hz:0.5,name:"Hallowed Cloister",realm:"sanctum",el:"light",xp:40,bg:"art/bg-ar-cloister.webp",fx:"Light moves hit 25% harder. No one can be Cursed, and Brace blocks 80%."},
  void:{hz:0.51,name:"The Quiet Dark",realm:"void",el:"shadow",xp:90,bg:"art/bg-ar-dark.webp",fx:"Shadow moves hit 25% harder. Every attack has a 10% chance to miss in the dark."},
  rift:{hz:0.44,name:"The Rift",realm:"void",el:"shadow",xp:90,bg:"art/bg-ar-rift.webp",fx:"Shadow moves hit 25% harder. Damage swings wildly, from 60% to 140%."}
};
function regionBest(realm){let b=1;for(const k in REGION)if(REGION[k].realm===realm)b=Math.max(b,regions[k]?.lv||1);return b}
const FIELD=()=>F?F.rid:null;
function fieldMult(el){const r=FIELD();if(!r)return 1;const R=REGION[r];let m=1;if(R.el&&R.el===el)m*=1.25;if(r==="hearth"&&NAT.includes(el))m*=1.1;if(r==="falls"&&el==="fire")m*=.75;return m}
const killsNeed=L=>3*Math.round(4+.8*(L-1)); // fights needed rise gently: 4, 5, 6, 6, 7, 8, 9, 10 ... (3 enemies per fight)
const winXP=(rid,L,boss)=>Math.round(REGION[rid].xp*Math.pow(1.35,L-1)*(boss?5:1));
const FOE_BASE=.5,BOSS_HP=3.5,BOSS_ATK=.65,BOSS_ACTS=2,BOSS_COPY=.25;
const HP_STEP=1.45,ATK_STEP=1.35; // how much stronger enemies get per region level
const foeScale=(L,boss)=>({hp:FOE_BASE*Math.pow(HP_STEP,L-1)*(boss?BOSS_HP:1),atk:FOE_BASE*Math.pow(ATK_STEP,L-1)*(boss?BOSS_ATK:1),def:FOE_BASE*Math.pow(ATK_STEP,L-1)});

function renderRegions(){
  const team=slots.battle.filter(id=>roster[id]);
  $("teamStrip").innerHTML=team.length?team.map(id=>{const m=MONSTERS.find(x=>x.id===id);return`<div class="tm"><img loading="lazy" src="${m.art}" alt=""><span>${m.name}</span><small style="color:${ELC[META[id].el]}">${ELN[META[id].el]}</small></div>`}).join("")
    :`<p class="slot-tip">No battle team yet. Hatch some eggs and open a creature to add it to your team.</p>`;
  {const tu=team.map(id=>mkUnit(MONSTERS.find(x=>x.id===id),roster[id].star,"you")),bd=teamBonds(tu,null);if(team.length)$("teamStrip").innerHTML+=`<p class="bonds">${bd.lines.length?"Bonds: "+bd.lines.join(" · "):"No team bonds yet"} · <span>plus home field in its own realm's arenas</span></p>`;
    $("teamStrip").innerHTML+=`<button class="powline" id="teamPow"><i>Team <b>${fmt(teamPower(team))}</b></i><i>Hatcher <b>${fmt(hatcherPower())}</b></i><span>How power works ›</span></button>`;$("teamPow").onclick=()=>openPower()}
  const list=$("regionList");list.innerHTML="";
  $("btabs").innerHTML=[["arenas","Arenas"],["raids","Raids"],["rush","Boss Rush"]].map(([k,n])=>`<button class="${battleTab===k?"on":""}" data-k="${k}">${n}</button>`).join("");
  $("btabs").querySelectorAll("button").forEach(x=>x.onclick=()=>{battleTab=x.dataset.k;renderRegions()});
  if(battleTab==="rush"){list.appendChild(rushCard());return}
  if(battleTab==="raids"){tip("raids");raidCards(list,team);return}
  {const s=sweepsLeft(),h=document.createElement("p");h.className="sweepnote";h.textContent=`Sweeps left today: ${s} of ${SWEEPS_PER_DAY}. Sweep any level below an arena's top level to collect a win instantly.`;list.appendChild(h)}
  EGGS.forEach(e=>{
    const best=regionBest(e.id),h=document.createElement("div");h.className="realmh";h.style.setProperty("--c",e.c);
    h.innerHTML=`<b>${REALMN[e.id]}</b>${best>1?`<small>${e.name} luck: +${(regionLuck(e.id).total*100).toFixed(1)}% rarer hatches</small>`:""}`;list.appendChild(h);
    for(const rid in REGION){const G=REGION[rid];if(G.realm!==e.id)continue;
      const R=regions[rid],need=killsNeed(R.lv),ready=R.kills>=need,c=document.createElement("div"),pl=Math.min(R.lv,R.pick||R.lv),replay=pl<R.lv;
      c.className="region ar";c.style.setProperty("--c",G.el?ELC[G.el]:e.c);c.style.setProperty("--bg",`url(${G.bg})`);
      c.innerHTML=`<div class="rtop"><span class="eyebrow">${G.el?ico(G.el):ico("fire")+ico("water")+ico("lightning")+ico("wind")+ico("earth")} ${G.name}</span><b class="rstars">${starsHTML(R.lv)}<span>★ ${R.lv}</span></b></div>
        <div class="rfx">${G.fx}</div>
        <div class="prog"><div class="bar"><i style="width:${Math.min(100,100*R.kills/need)}%"></i></div><small>${ready?"Boss ready":`${R.kills} / ${need} defeated`}</small></div>
        ${team.length?(()=>{const bossF=ready&&!replay,ep=enemyPower(rid,bossF?R.lv:pl,bossF),tp=teamPower(team,rid);return`<div class="epow">${bossF?"Boss power":"Enemy power"} <b>${fmt(ep)}</b> · your team here <b class="${tp>=ep*PW_OK?"ok":"hard"}">${fmt(tp)}</b></div>`})():""}
        <div class="row lvrow"><span class="lvpick">${R.lv>1?`<button data-a="dn" aria-label="Lower level">−</button>`:""}<b>Level ${pl}</b>${R.lv>1?`<button data-a="up" aria-label="Higher level">+</button>`:""}</span>
          <button class="btn${ready&&!replay?"":" ghost"}" data-a="go" ${team.length?"":"disabled"}>${replay?"Replay":ready?"Fight the boss":"Fight"}</button>${replay?`<button class="btn ghost" data-a="sw" ${team.length&&sweepsLeft()?"":"disabled"}>Sweep</button>`:""}</div>`;
      const q=a=>c.querySelector(`[data-a="${a}"]`);
      q("go").onclick=()=>startFight(rid,ready&&!replay);
      if(q("dn"))q("dn").onclick=()=>{R.pick=Math.max(1,pl-1);saveBattle();renderRegions()};
      if(q("up"))q("up").onclick=()=>{R.pick=Math.min(R.lv,pl+1);saveBattle();renderRegions()};
      if(q("sw"))q("sw").onclick=()=>sweep(rid,pl);
      if(R.lv>1)tip("replay");
      list.appendChild(c);}
  });
}

// ---- the fight: turn-based ----
let F=null;
// ---- auto battle and speed ----
let AUTO=false,SPD=1;try{const s=JSON.parse(localStorage.getItem("hatchery-auto")||"{}");AUTO=!!s.auto;SPD=s.spd===2?2:1}catch(e){}
const sleep=ms=>window.__fast?Promise.resolve():new Promise(r=>setTimeout(r,ms/SPD));
// animations inside a fight run faster at 2x
{const _an=Element.prototype.animate;Element.prototype.animate=function(k,o){if(SPD>1){const f=document.getElementById("fight");if(f&&!f.hidden){if(typeof o==="number")o/=SPD;else if(o&&o.duration)o=Object.assign({},o,{duration:o.duration/SPD,delay:(o.delay||0)/SPD})}}return _an.call(this,k,o)}}
// the move Auto picks for you: scores every ready move against the enemy in front of you
function bestMove(u){if(u.charging)return u.charging;
  const foe=curFoe(),ready=u.moves.filter(x=>!(u.cds[x.id]>0));if(!ready.length)return STRIKE;
  const mates=F.team.filter(c=>c.hp>0),cashers=new Set(mates.flatMap(c=>c.moves.filter(x=>x.pow).map(x=>x.el)));
  const sc=x=>{
    if(x.brace)return foe.charging?100:u.hp<u.max*.3?6:-1;
    if(x.heal&&!x.pow)return u.hp<u.max*.4?60:u.hp<u.max*.7?8:-1;
    if(x.shield&&!x.pow)return u.shield?-1:(u.hp<u.max*.5?14:6);
    if(!x.pow&&(x.sAtk||x.sDef||x.sSpd))return (F.round||0)<2&&u.hp>u.max*.6&&!(x.sAtk&&u.mod.atk[0]>1)&&!(x.sDef&&u.mod.def[0]>1)?12:-1;
    if(!x.pow)return x.stc&&EL_ST[x.el]&&!foe.st[EL_ST[x.el]]&&[...cashers].some(e=>COMBO[e]&&COMBO[e][0]===EL_ST[x.el])?16:2;
    let v=x.pow*(x.hits||1)*10;
    if(!x.els&&x.el!=="random")v*=typeMult(x.el,foe.el);
    v*=fieldMult(x.el)*(F.elB&&F.elB[x.el]?1+F.elB[x.el]:1);
    if(COMBO[x.el]&&foe.st&&foe.st[COMBO[x.el][0]]>0)v*=1.8;          // cash in a status
    if(x.stc&&EL_ST[x.el]&&!foe.st[EL_ST[x.el]])v*=1.1;                // or leave one
    if(x.charge)v*=foe.hp<foe.max*.25?.3:.6;                             // two turns, and can be braced
    if(x.drain&&u.hp<u.max*.6)v*=1.2;
    return v};
  let best=ready[0],bv=-1e9;for(const x of ready){const v=sc(x);if(v>bv){bv=v;best=x}}return best}
let autoT=0;
function autoTick(){clearTimeout(autoT);if(!AUTO||!F||F.over||F.busy||window.__fast)return;const f=$("fight"),g=$("guide");if(!f||f.hidden||(g&&!g.hidden))return;
  autoT=setTimeout(()=>{if(AUTO&&F&&!F.over&&!F.busy&&!$("fight").hidden&&$("guide").hidden)pick(bestMove(chooser()))},500/SPD)}
function paintAuto(){const a=$("autoBtn"),s=$("spdBtn");if(a){a.classList.toggle("on",AUTO);a.setAttribute("aria-pressed",AUTO)}if(s){s.classList.toggle("on",SPD>1);s.textContent=SPD+"×";s.setAttribute("aria-pressed",SPD>1)}}
function saveAuto(){try{localStorage.setItem("hatchery-auto",JSON.stringify({auto:AUTO,spd:SPD}))}catch(e){}}
const EVO_BUFF=1.2; // evolved forms are 20% stronger
const PRIMAL_PAS=1.75; // Primal passives are 75% stronger (chances cap at 90%)
const SANCT_HEAL=1.6,SANCT_BOOST=1.75; // Sanctum support: stronger heals and boosts that also reach teammates
// ---- team bonds: home field, realm, element and kind; they change Attack/Defense/Speed through eff() and element damage through F.elB ----
const HOME=.15,REALM_B=[0,0,.05,.12],EL_B=[0,0,.1,.2],KIND_B=[0,0,.06,.12];
const realmsOf=m=>!m?[]:m.fusion?[...new Set(m.fusion.flatMap(id=>(MONSTERS.find(x=>x.id===id)||{eggs:[]}).eggs))]:(m.eggs||[]);
function teamBonds(team,rid){
  const out={lines:[],elB:{}};const cnt=f=>{const c={};team.forEach(u=>{const ks=[].concat(f(u));ks.forEach(k=>c[k]=(c[k]||0)+1)});return c};
  team.forEach(u=>u.fb={atk:1,def:1,spd:1});
  const home=rid&&REGION[rid]?REGION[rid].realm:null;
  if(home){const hs=team.filter(u=>realmsOf(u.m).includes(home));hs.forEach(u=>{u.fb.atk*=1+HOME;u.fb.def*=1+HOME;u.fb.spd*=1+HOME});if(hs.length)out.lines.push(`Home field ×${hs.length}`)}
  const rc=cnt(u=>realmsOf(u.m));let rb=0,rn="";for(const k in rc)if(REALM_B[Math.min(3,rc[k])]>rb){rb=REALM_B[Math.min(3,rc[k])];rn=k}
  if(rb){team.forEach(u=>{u.fb.atk*=1+rb;u.fb.def*=1+rb;u.fb.spd*=1+rb});out.lines.push(`${REALMN[rn]} bond +${Math.round(rb*100)}%`)}
  const ec=cnt(u=>u.el);for(const k in ec){const v=EL_B[Math.min(3,ec[k])];if(v&&ELN[k]&&k!=="none"){out.elB[k]=v;out.lines.push(`${ELN[k]} bond +${Math.round(v*100)}%`)}}
  const kc=cnt(u=>META[u.id].kind);for(const k in kc){const v=KIND_B[Math.min(3,kc[k])];if(v){team.filter(u=>META[u.id].kind===k).forEach(u=>{u.fb.def*=1+v;u.fb.spd*=1+v});out.lines.push(`${k[0].toUpperCase()+k.slice(1)} bond +${Math.round(v*100)}%`)}}
  return out}
function mkUnit(m,star,side,sc){
  const s=stats(m,star),lo=side==="you"?getLoadout(m.id):FOE_LO,pm=side==="you"?playerMult(m):1,k=sc||{hp:pm,atk:pm,def:pm};
  const u={id:m.id,m,side,el:META[m.id].el,max:Math.max(1,Math.round(s.hp*k.hp)),atk:s.atk*k.atk,def:s.def*k.def,spd:s.spd,
    moves:movePool(m).filter(x=>lo.includes(x.id)),cds:{},mod:{atk:[1,0],def:[1,0],spd:[1,0]},dot:0,dotDmg:0,stun:false,shield:0,st:{},braced:0,charging:null};
  if(m.evolvesFrom){u.max=Math.round(u.max*EVO_BUFF);u.atk*=EVO_BUFF;u.def*=EVO_BUFF;u.spd*=EVO_BUFF}
  u.pas=passiveOf(m);[u.pv,u.pv2]=pasVals(m,star);u.once={};u.over=0;u.kills=0;
  u.hp=u.max;return u;
}
const EGG_EL={hearth:"earth",sanctum:"light",void:"shadow"},EGG_HP=.45,EGG_ATK=.5,EGG_DEF=1.2;
function mkEgg(rid,boss){
  const realm=REGION[rid].realm,e=EGGS.find(x=>x.id===realm),el=REGION[rid].el||EGG_EL[realm];
  const u={id:"egg-"+rid,m:{id:"egg-"+rid,name:"Boss Egg",art:""},egg:e,isEgg:true,boss:true,side:"foe",el,max:Math.round(boss.max*EGG_HP),atk:boss.atk*EGG_ATK,def:boss.def*EGG_DEF,spd:1,
    moves:[{id:"e0",n:"Tremor",pow:.6,el}],cds:{},mod:{atk:[1,0],def:[1,0],spd:[1,0]},dot:0,dotDmg:0,stun:false,shield:0,st:{},braced:0,charging:null,once:{}};
  u.hp=u.max;return u;
}
function eggFrame(){const f=curFoe();if(f.isEgg)setFrame($("bossEgg"),f.egg,Math.min(5,Math.floor((1-Math.max(0,f.hp)/f.max)*6)))}
const eff=(u,k)=>u[k]*u.mod[k][0]*(u.fb&&u.fb[k]||1)*((k==="atk"||k==="spd")&&inFight(u)?1+aura(u.side,k==="atk"?"auraAtk":"auraSpd"):1)*(k==="atk"&&u.muts&&u.hp<u.max/2&&u.muts.includes("enraged")?1.5:1)*(k==="spd"&&u.st&&u.st.root?.7:1)*(k==="def"&&u.st&&u.st.scatter?.75:1);
function heal(u,amt,quiet){if(u.st&&u.st.curse>0){if(!quiet)floatOn(u,"Cursed","st");return 0}if(FIELD()==="sanctum")amt*=1.5;if(inFight(u))amt*=1+aura(u.side,"beacon");const h=Math.max(0,Math.min(u.max-u.hp,Math.round(amt)));u.hp+=h;return h}
function applySt(t,k,src,skip){if(!skip&&resists(t)){pasFx(t,"Resisted");return false}
  if(MU(t,"warded")){floatOn(t,"Warded","st");return false}
  if(k==="burn"&&t.st.soak>0)return false;if(k==="soak")delete t.st.burn;
  if(k==="curse"&&FIELD()==="cloister"){floatOn(t,"Sanctified","st");return false}
  tip("status");t.st[k]=ST[k].t+(FIELD()==="hearth"?1:0)+(src&&src.side==="you"?RB("linger"):0);if(k==="burn")t.burnDmg=.3*eff(src,"atk")*(FIELD()==="ember"?2:1);floatOn(t,ST[k].n,"st");vStatus(t,k);return true}
const curFoe=()=>F.foes[F.fa];
const chooser=()=>F.boss?(F.team[F.ch]&&F.team[F.ch].hp>0?F.team[F.ch]:(F.team.find(c=>c.hp>0)||F.team[F.ch]||F.team[0])):F.team[F.active];
const uname=u=>u.isEgg?"The Boss Egg":(u.side==="foe"?"Enemy ":"")+u.m.name;
const ICO={burn:[0,0],soak:[1,0],shock:[2,0],root:[3,0],blind:[4,0],curse:[5,0],poison:[0,1],stun:[1,1],guard:[2,1],atkup:[3,1],atkdn:[4,1],defup:[5,1],
  defdn:[0,2],spdup:[1,2],spddn:[2,2],charge:[3,2],heal:[4,2],fire:[5,2],water:[0,3],lightning:[1,3],wind:[2,3],earth:[3,3],light:[4,3],shadow:[5,3],scatter:[2,3]};
function ico(k,cls){const p=ICO[k];return p?`<i class="ico${cls?" "+cls:""}" style="background-position:${p[0]*20}% ${p[1]*100/3}%"></i>`:""}
const icw=(k,n,cls)=>`<i class="ic${cls?" "+cls:""}" title="${n}">${ico(k)}</i>`;
function ailments(u){if(!u||u.hp<=0)return"";const a=[];for(const k in u.st||{})if(u.st[k]>0)a.push(icw(k,ST[k].n));
  if(u.dot>0)a.push(icw("poison","Poisoned"));if(u.stun)a.push(icw("stun","Stunned"));
  if(u.shield>0||u.braced)a.push(icw("guard","Guarded"));if(u.charging)a.push(icw("charge","Charging","chg"));
  for(const k of["atk","def","spd"])if(u.mod[k][0]!==1)a.push(icw(k+(u.mod[k][0]>1?"up":"dn"),k.toUpperCase()+(u.mod[k][0]>1?" up":" down")));
  return a.join("")}
function fieldUnits(){return F.boss?[...F.team.filter(c=>c.hp>0),curFoe()]:[F.team[F.active],curFoe()]}
function paintIcons(){if(!F)return;$("foeIcons").innerHTML=ailments(curFoe());$("myIcons").innerHTML=ailments(F.shown||chooser());
  const us=fieldUnits().filter(u=>u&&u.hp>0).sort((a,b)=>(P(b,"galeforce")-P(a,"galeforce"))||eff(b,"spd")-eff(a,"spd"));
  $("torder").innerHTML='<span>Speed order</span>'+us.map(u=>u.isEgg?'<b class="foe egg">🥚</b>':`<img class="${u.side}" src="${u.m.art}" alt="${u.m.name}">`).join("")}
function say(t){$("flog").textContent=t}
let battleTab="arenas";
// enemies for a normal arena fight: three from the arena's realm, leaning toward its element
function arenaFoes(rid){const G=REGION[rid],all=MONSTERS.filter(m=>m.eggs.includes(G.realm)&&!m.evolvesFrom),lean=m=>G.el&&META[m.id].el===G.el;
  const pool=all.filter(m=>m.tier==="common"||m.tier==="uncommon"||!m.tier),pk=[];
  while(pk.length<3&&pool.length){const el=pk[0]&&META[pk[0].id].el,w=pool.map(m=>lean(m)?6:pk.length&&META[m.id].el===el?2.5:1);let r=Math.random()*w.reduce((a,c)=>a+c,0),i=0;for(;i<w.length-1;i++){if(r<w[i])break;r-=w[i]}pk.push(pool.splice(i,1)[0])}
  return pk}
// ---- sweeps: collect a win on a level below the arena's top level without fighting ----
const SWEEPS_PER_DAY=20;let sweeps={day:"",used:0};try{sweeps=Object.assign(sweeps,JSON.parse(localStorage.getItem("hatchery-sweeps")||"{}"))}catch(e){}
const todayKey=()=>{const d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()};
function sweepsLeft(){if(sweeps.day!==todayKey()){sweeps.day=todayKey();sweeps.used=0}return Math.max(0,SWEEPS_PER_DAY-sweeps.used)}
function sweep(rid,L){if(!sweepsLeft())return toast("No sweeps left today");sweeps.used++;
  const foes=arenaFoes(rid),got=foes.filter(m=>roster[m.id]);got.forEach(m=>{roster[m.id].dupes++;roster[m.id].caught=(roster[m.id].caught||0)+1});
  const xp=winXP(rid,L,false);saveBattle();saveProg();addXP(xp);
  toast(`Swept ${REGION[rid].name} level ${L}: +${fmt(xp)} XP`+(got.length?` · copies: ${got.map(m=>m.name).join(", ")}`:""));renderRegions()}
function startFight(rid,boss,keep){if(boss)tip("boss");
  const prev=keep&&F&&!F.boss?F.team[F.active]?.id:null;
  const ids=slots.battle.filter(id=>roster[id]);if(!ids.length)return;
  const G=REGION[rid],realm=G.realm,R=regions[rid],FL=boss?R.lv:Math.min(R.lv,R.pick||R.lv),all=MONSTERS.filter(m=>m.eggs.includes(realm)&&!m.evolvesFrom);let foes;
  const lean=m=>G.el&&META[m.id].el===G.el; // the arena's element turns up far more often
  if(boss){let pool=all.filter(m=>!m.tier||m.tier==="epic"||m.tier==="legendary");const mine=pool.filter(lean);if(mine.length&&Math.random()<.75)pool=mine;const m=pool[Math.floor(Math.random()*pool.length)];const bu=mkUnit(m,1,"foe",foeScale(R.lv,true));bu.boss=true;foes=[mkEgg(rid,bu),bu]}
  else foes=arenaFoes(rid).map(m=>mkUnit(m,1,"foe",foeScale(FL,false)));
  F={rid,boss,lv:FL,foes,fa:0,team:ids.map(id=>mkUnit(MONSTERS.find(x=>x.id===id),roster[id].star,"you")),active:0,ch:0,picks:[],busy:false,over:false};
  if(prev){const i=F.team.findIndex(c=>c.id===prev);if(i>=0)F.active=i} // back-to-back fights keep your chosen creature
  {const bd=teamBonds(F.team,rid);F.elB=bd.elB;F.bonds=bd.lines;if(bd.lines.length)tip("bonds")}
  setRegion(EGGS.findIndex(e=>e.id===realm));root.style.setProperty("--c",EGGS.find(e=>e.id===realm).c);setArena(G.bg,G.hz);fxPreload();
  $("field").innerHTML=(G.el?ico(G.el):ico("earth"))+`<span>${G.name}</span>`;$("field").onclick=()=>toast(G.fx+(F.bonds&&F.bonds.length?" Your bonds: "+F.bonds.join(", ")+".":""));
  view("fight");$("arena").classList.toggle("boss",boss);$("arena").classList.remove("egging");$("fightResult").hidden=true;$("fx2").innerHTML="";
  showFoe();say(boss?"The boss waits inside its egg. Break it open.":"Choose a move, or tap a teammate to swap in.");paintFight();
  (boss?F.team:[F.team[F.active]]).forEach(enter);enter(curFoe());
}
function showFoe(){const f=curFoe(),img=$("foeImg");$("arena").classList.toggle("egging",!!f.isEgg);if(f.isEgg)return eggFrame();img.getAnimations().forEach(x=>x.cancel());img.src=f.m.art;img.alt=f.m.name;img.style.transform=`scaleX(${flipOf(f)})`}
function showMine(who){const u=who||chooser(),img=$("myImg");if(F.shown!==u){F.shown=u;img.getAnimations().forEach(x=>x.cancel());img.src=u.m.art;img.alt=u.m.name;img.style.transform=`scaleX(${flipOf(u)})`}img.style.opacity=u.hp>0?1:.25}
function lunge(u){if(window.__fast)return;const mine=u.side==="you";if(mine&&F.shown!==u)return;if(u.isEgg)return shake($("bossEgg"),6,240);
  const s=`scaleX(${flipOf(u)})`;(mine?$("myImg"):$("foeImg")).animate([{transform:`translate(0,0) ${s}`},{transform:(mine?"translate(26px,-16px) ":"translate(-26px,16px) ")+s},{transform:`translate(0,0) ${s}`}],{duration:280,easing:"ease-out"})}
function renderTeam(){
  $("teamRow").innerHTML=F.team.map((c,i)=>{const on=F.boss?(i===F.ch&&!F.busy&&!F.over):i===F.active;
    return`<button class="mate${on?" on":""}${c.hp<=0?" ko":""}" data-i="${i}" aria-label="${c.hp<=0?c.m.name+" knocked out":c.m.name}">
    <img src="${c.m.art}" alt=""><span>${c.m.name}</span><div class="hp"><i style="width:${100*Math.max(0,c.hp)/c.max}%"></i></div><small class="ms">${c.hp>0?ailments(c):""}</small></button>`}).join("");
  $("teamRow").querySelectorAll(".mate").forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(F.over||F.busy||F.boss||F.team[i].hp<=0||i===F.active)return;if(F.team[F.active].st.root>0)return toast(F.team[F.active].m.name+" is rooted and can't swap out");pick({swap:i})});
}
function renderMoves(){
  const box=$("moves"),who=$("fwho");if(F.over){box.innerHTML="";who.textContent="";return}
  setTimeout(autoTick,0);
  const u=chooser(),ready=u.moves.filter(x=>!(u.cds[x.id]>0)),list=u.charging?[u.charging]:ready.length?u.moves:[STRIKE],foe=curFoe();
  who.textContent=F.busy?"":u.charging?u.m.name+" is charging":u.m.name+"'s move";
  box.innerHTML=list.map((x,i)=>{const cd=u.charging?0:u.cds[x.id]||0,tm=x.pow&&x.el!=="random"&&!x.els?typeMult(x.el,foe.el):1,cb=x.pow&&COMBO[x.el]&&foe.st&&foe.st[COMBO[x.el][0]]>0;
    return`<button class="mv${cb&&!cd?" combo":""}${u.charging?" release":""}" data-i="${i}" ${cd||F.busy?"disabled":""} style="--e:${ELC[x.el]}"><b>${ico(x.el,"mvi")}${u.charging?"Release "+x.n:x.n}</b><small>${cd?"Ready in "+cd:(cb?"Combo! · ":"")+role(x)+" · "+ELN[x.el]+(tm>1.2?" ▲":tm<1?" ▼":"")}</small></button>`}).join("");
  box.querySelectorAll(".mv").forEach(b=>b.onclick=()=>pick(list[+b.dataset.i]));
}
// raid bosses: when a bar empties, the next one fills
function barCheck(u){if(u&&u.barsLeft>1&&u.hp<=0){u.barsLeft--;u.hp+=u.max;if(u.hp<=0)u.hp=1;floatOn(u,"Bar broken","combo");return true}return false}
// raid bosses show their health as several bars
function paintFoeHp(f,more){const hp=Math.max(0,f.hp);
  if(f.barHp){const left=f.barsLeft||1,cur=hp;$("foeHp").style.width=(left?100*cur/f.barHp:0)+"%";
    $("foeHpTxt").textContent=`Bar ${left} of ${f.bars} · ${fmt(Math.ceil(cur))} / ${fmt(f.barHp)}`+(F.raid?` · turn ${Math.min(RAID_ROUNDS,(F.round||0)+1)} of ${RAID_ROUNDS}`:"");return}
  $("foeHp").style.width=(100*hp/f.max)+"%";
  $("foeHpTxt").textContent=`${fmt(Math.ceil(hp))} / ${fmt(f.max)}`+(more>0&&!F.boss?` · ${more} more waiting`:"")+(F.raid?` · turn ${Math.min(RAID_ROUNDS,(F.round||0)+1)} of ${RAID_ROUNDS}`:"")}
function paintFight(){
  const f=curFoe(),more=F.foes.length-1-F.fa;
  $("foeName").textContent=(F.boss&&!f.isEgg&&!F.rush?"Boss · ":"")+f.m.name;eggFrame();
  $("foeLv").innerHTML=`<i class="eltag" style="color:${ELC[f.el]}">${ico(f.el,"eli")}${ELN[f.el]}</i>${f.pas&&!(f.muts&&f.muts.length)?` <i class="eltag pastag">${f.pas.n}</i>`:""} ${(f.muts||[]).map(k=>` <i class="eltag pastag mut">${MUT[k].n}</i>`).join("")} <span class="lvs">${F.rush?"F"+F.floor:"★ "+F.lv}</span>`;
  paintFoeHp(f,more);
  showMine();renderTeam();renderMoves();paintIcons();
}
function floatText(txt,x,y,cls){
  const d=document.createElement("div");d.className="dmg "+(cls||"");d.textContent=txt;d.style.left=x+"px";d.style.top=y+"px";
  $("fx2").appendChild(d);setTimeout(()=>d.remove(),900);
}
function floatOn(u,txt,cls){
  const a=$("arena").getBoundingClientRect();
  const on=u.side==="foe"?(u.isEgg?$("bossEgg"):$("foeImg")):F.shown===u?$("myImg"):null;
  if(on){const r=on.getBoundingClientRect();return floatText(txt,r.left-a.left+r.width/2+(Math.random()*50-25),r.top-a.top+r.height*(.25+Math.random()*.15),cls)}
  const r=$("teamRow").children[F.team.indexOf(u)]?.getBoundingClientRect();
  floatText(txt,r?r.left-a.left+r.width/2:a.width/2,a.height-30,cls);
}
function hitFx(t){
  if(window.__fast)return;
  if(t.side==="foe"){if(t.isEgg){eggFrame();shake($("bossEgg"),8,220)}else{const s=`scaleX(${flipOf(t)})`;$("foeImg").animate([{transform:`translate(0,0) ${s}`},{transform:`translate(12px,-4px) ${s}`,filter:"brightness(2.2)"},{transform:`translate(0,0) ${s}`}],{duration:240})}
    if(!muted&&audio()){tone("sawtooth",220,90,.18,.07);noise(.08,.1,2200)}try{navigator.vibrate&&navigator.vibrate(15)}catch(e){}}
  else{if(F.shown===t){const s=`scaleX(${flipOf(t)})`;$("myImg").animate([{transform:`translate(0,0) ${s}`},{transform:`translate(-12px,4px) ${s}`,filter:"brightness(2.2)"},{transform:`translate(0,0) ${s}`}],{duration:240})}shake(app,F.boss?8:5,240);if(!muted&&audio()){tone("sine",120,50,.25,.15);noise(.1,.12,900)}}
}
function pick(mv){
  if(!F||F.over||F.busy)return;
  if(F.boss){
    F.picks.push({u:F.team[F.ch],mv});
    let n=F.ch+1;while(n<F.team.length&&F.team[n].hp<=0)n++;
    if(n<F.team.length){F.ch=n;paintFight();return}
  }else F.picks=[mv.swap!=null?{swap:mv.swap}:{u:F.team[F.active],mv}];
  runTurn();
}
function aiPick(u,noCharge){
  if(u.charging)return u.charging;
  const t=F.boss?null:F.team[F.active],ready=u.moves.filter(x=>!(u.cds[x.id]>0)&&!(noCharge&&x.charge));if(!ready.length)return STRIKE;
  const br=ready.find(x=>x.brace);if(br&&F.team.some(c=>c.hp>0&&c.charging)&&Math.random()<.7)return br;
  if(t){const w=ready.map(x=>{if(x.brace)return u.hp<u.max*.35?.6:.1;if(x.heal&&!x.pow)return u.hp<u.max*.45?2.5:.15;
      let v=x.pow?3:1;const tm=x.pow&&!x.els&&x.el!=="random"?typeMult(x.el,t.el):1;v*=tm>1.2?1.6:tm<1?.6:1;
      if(x.pow&&COMBO[x.el]&&t.st[COMBO[x.el][0]]>0)v*=3;if(x.stc===1&&EL_ST[x.el]&&!t.st[EL_ST[x.el]])v=2;if(x.charge)v=1.4;return v});
    let r=Math.random()*w.reduce((a,c)=>a+c,0);for(let i=0;i<ready.length;i++){if(r<w[i])return ready[i];r-=w[i]}}
  const heal=ready.find(x=>x.heal&&!x.pow);if(heal&&u.hp<u.max*.45&&Math.random()<.6)return heal;
  const w=ready.map(x=>x.pow?3:(x.heal&&u.hp>u.max*.8?0.2:1));let r=Math.random()*w.reduce((a,b)=>a+b,0);
  for(let i=0;i<ready.length;i++){if(r<w[i])return ready[i];r-=w[i]}return ready[0];
}
async function runTurn(){
  const S=F,gone=()=>F!==S||S.fled;
  F.busy=true;paintFight();
  const acts=F.picks.slice(),foe=curFoe();F.picks=[];
  for(let k=0;k<(F.boss&&!foe.isEgg?BOSS_ACTS:1);k++){const mv=aiPick(foe,k>0);acts.push({u:foe,mv,foe:true});if(mv.charge||foe.charging)break}
  // swaps go first, then "strikes first" moves, then by Speed
  acts.forEach(a=>a.o=a.swap!=null?1e9:((a.mv.pri||0)+(P(a.u,"galeforce")?1:0)+(FIELD()==="gale"&&a.mv.el==="wind"?1:0))*1e6+eff(a.u,"spd")+Math.random());acts.sort((a,b)=>b.o-a.o);
  for(const a of acts){
    if(a.swap!=null){F.team[F.active].charging=null;F.active=a.swap;say(F.team[a.swap].m.name+" steps in.");enter(F.team[a.swap]);showMine();renderTeam();await sleep(550);if(gone())return;continue}
    if(a.u.hp<=0)continue;
    if(a.u.stun){a.u.stun=false;a.u.charging=null;say(uname(a.u)+" is stunned and can't move.");paintIcons();await sleep(700);if(gone())return;continue}
    if(a.u.st&&a.u.st.shock>0&&Math.random()<(a.u.boss?.15:.3)){a.u.charging=null;say(uname(a.u)+" is shocked and can't move.");floatOn(a.u,"Shocked","st");paintIcons();await sleep(700);if(gone())return;continue}
    let t;
    if(a.foe){const alive=F.team.filter(c=>c.hp>0);t=F.boss?alive[Math.floor(Math.random()*alive.length)]:F.team[F.active];if(!t||t.hp<=0)t=alive[0]}
    else t=curFoe();
    if(!t||t.hp<=0)continue;
    await doMove(a.u,a.mv,t);
    if(gone())return;
  }
  await endTurn(S);
}
async function doMove(u,mv,t){
  let note="";const S=F;
  if(mv.charge&&u.charging!==mv&&!(u.side==="you"&&RB("trigger"))){u.charging=mv;if(F.boss){if(u.side==="you")showMine(u)}say(`${uname(u)} is gathering power for ${mv.n}…`);floatOn(u,"Charging","st");tip("charge");lunge(u);vCharge(u,mv.el);paintIcons();await sleep(800);return}
  if(u.charging===mv)u.charging=null;
  if(mv.id)u.cds[mv.id]=mv.brace&&u.side==="you"&&RB("iron")?0:(mv.cd||0)+1;
  if(F.boss){if(u.side==="you")showMine(u);else if(t.side==="you")showMine(t)}
  say(`${uname(u)} used ${mv.n}.`);lunge(u);if(window.__fast)await sleep(260);else await playFx(u,mv,t);if(F!==S||S.fled)return;
  if(mv.pow){
    const n=mv.hits||1;let tot=0;
    for(let h=0;h<n&&t.hp>0;h++){
      const el=mv.els?mv.els[h%mv.els.length]:mv.el==="random"?NAT[Math.floor(Math.random()*NAT.length)]:mv.el,a=eff(u,"atk"),df=eff(t,"def")*(1-PV(u,"rend"));
      if(h>0&&!window.__fast){await playFx(u,{n:"",el,pow:1},t);if(F!==S||S.fled)return}
      let tm=typeMult(el,t.el);
      if((P(t,"steady")||P(t,"balance"))&&(t.el==="light"||t.el==="shadow"))tm/=GLASS;
      if((P(t,"adaptive")||P(t,"primordial"))&&tm>1)tm=1;
      if(P(u,"primordial")&&tm<1)tm=1;
      let d=mv.pow*a*(2*a/(a+df))*tm*fieldMult(el)*(u.side==="you"&&F.elB&&F.elB[el]?1+F.elB[el]:1)*(FIELD()==="rift"?.6+Math.random()*.8:.9+Math.random()*.2),crit=false,lab="";
      const tst={...(t.st||{})},slowed=t.mod.spd[0]<1||!!tst.root;
      const cb=COMBO[el],combo=!!(cb&&t.st&&t.st[cb[0]]>0);if(combo){delete t.st[cb[0]];d*=COMBO_MULT*(u.side==="you"?1+.6*RB("combo"):1);floatOn(t,cb[1],"combo");vCombo(t,el)}
      if(mv.pack)d*=1+.25*((u.side==="you"?F.team:F.foes).filter(c=>c.hp>0).length-1);
      // passives that change damage dealt and taken
      if(P(u,"ferocity")&&u.hp<u.max/2)d*=1+u.pv;
      if(P(u,"voidhunger")&&t.hp<t.max/2)d*=1+PV(u,"voidhunger");
      if(P(u,"conductor")&&(tst.shock||tst.soak))d*=1+PV(u,"conductor");
      if(P(u,"outspeed")&&eff(u,"spd")>eff(t,"spd"))d*=1+PV(u,"outspeed");
      if(P(u,"dragunder")&&slowed)d*=1+PV(u,"dragunder");
      if(P(u,"cursehunt")&&(tst.curse||tst.blind))d*=1+PV(u,"cursehunt");
      if(P(u,"comboAmp")&&combo)d*=1+PV(u,"comboAmp");
      if(P(u,"devour")&&u.kills)d*=1+.15*u.kills;
      if(P(u,"rend"))d*=1+PV(u,"rend")/2;
      if(P(u,"lastflock"))d*=1+PV(u,"lastflock")*[...F.team,...F.foes].filter(x=>x.hp<=0&&!x.isEgg).length;
      if(P(u,"allseeing")||P(u,"balance"))d*=1+u.pv;
      if(P(u,"ambush")&&!u.once.ambush){u.once.ambush=1;d*=u.pv;pasFx(u)}
      if(u.over)d*=1+u.over;
      if(u.side==="you"&&F.rush){d*=1+.3*RB("blood");if(!F.round)d*=1+.5*RB("ambush")}if(MU(t,"armored"))d*=.75;
      if(P(t,"guard")||P(t,"livingworld"))d*=1-t.pv;
      if(P(t,"lowdr")&&t.hp<t.max/2)d*=1-PV(t,"lowdr");
      d*=1-aura(t.side,"auraDr");
      if(t.braced)d*=t.braced;
      const cc=(mv.crit||0)+(P(u,"moonlit")?u.pv:0)+(u.side==="you"?.15*RB("keen"):0);
      if(cc&&Math.random()<cc){d*=1.5;crit=true}
      const sees=P(u,"allseeing");
      if(!sees&&((u.st&&u.st.blind>0&&Math.random()<.3)||(FIELD()==="void"&&Math.random()<.1))){d=0;lab="Missed"}
      else if(!sees&&P(t,"evasive")&&(!t.once.dodge||Math.random()<t.pv)){t.once.dodge=1;d=0;lab="Dodged"}
      else if(!sees&&P(t,"illusion")&&Math.random()<t.pv){d=0;lab="Illusion"}
      else if(!sees&&P(t,"dodge")&&Math.random()<PV(t,"dodge")){d=0;lab="Dodged"}
      else if(t.shield>0&&!sees){t.shield--;d=0;lab="Blocked"}
      d=Math.round(d);t.hp-=d;tot+=d;if(u.side==="you")u.dealt=(u.dealt||0)+d;
      if(d>0&&MU(t,"thorns")&&u.hp>0){const r=Math.max(1,Math.round(d*.15));u.hp-=r;floatOn(u,"-"+fmt(r),"hurt")}
      floatOn(t,d?(crit?"Crit! ":"")+fmt(d):lab||"Blocked",u.side==="you"?(crit?"crit":""):"hurt");hitFx(t);
      if(d>0&&P(t,"toll")&&u.hp>0){const r=Math.max(1,Math.round(d*PV(t,"toll")));u.hp-=r;floatOn(u,"-"+fmt(r),"hurt")}
      barCheck(t);
      if(t.hp<=0&&P(t,"undying")&&!t.once.undying){t.once.undying=1;t.hp=1;pasFx(t)}
      else if(t.hp<=0&&P(t,"rebirth")&&!t.once.rebirth){t.once.rebirth=1;t.hp=Math.round(t.max*t.pv);pasFx(t)}
      if(t.hp<=0&&P(t,"deathcry")&&u.hp>0&&!resists(u)){u.stun=true;pasFx(t)}
      if(t.hp<=0&&P(u,"devour")){u.kills++;const g=heal(u,u.max*PV(u,"devour"),1);if(g)floatOn(u,"+"+fmt(g),"heal");pasFx(u)}
      if(d>0&&t.hp>0){ // passives that add a status with each hit
        const on=(k,f)=>{if(P(u,k)&&Math.random()<PV(u,k)*(t.boss?.6:1))f()};
        on("burnhit",()=>applySt(t,"burn",u));on("shockhit",()=>applySt(t,"shock",u));on("blindhit",()=>applySt(t,"blind",u));on("blight",()=>applySt(t,"curse",u));
        on("slowhit",()=>{if(!resists(t))t.mod.spd=[Math.min(t.mod.spd[0],.7),3]});on("shredhit",()=>{if(!resists(t))t.mod.def=[Math.min(t.mod.def[0],.8),3]});
      }
      if(d>0&&u.hp>0){ // passives that punish whoever hits them
        if((P(t,"venomous")||P(t,"magmacore"))&&Math.random()<t.pv&&!resists(u)){u.dot=3;u.dotDmg=.35*eff(t,"atk");pasFx(t)}
        if(P(t,"coldcoil")&&Math.random()<t.pv&&!resists(u)){u.mod.spd=[.7,4];pasFx(t)}
        if(P(t,"thundercloak")&&Math.random()<t.pv*(u.boss?.5:1)&&!resists(u)){u.stun=true;pasFx(t)}
      }
      if(n===1&&d)note=tm>=1.5?" It hits hard.":tm<1?" It's resisted.":"";
      if(combo&&d)note+=" "+cb[1];
      if(n>1){await sleep(230);if(F!==S||S.fled)return}
    }
    if(mv.drain&&tot)heal(u,tot*mv.drain);
    if(P(u,"riptide")&&tot)heal(u,tot*u.pv,1);
  }
  if(t.hp>0&&(mv.stun||mv.dot||mv.tAtk||mv.tDef||mv.tSpd||(P(u,"staticvenom")&&mv.pow))){
    if(resists(t)){pasFx(t,"Resisted")}else{
    if((mv.stun&&Math.random()<mv.stun*(t.boss?.5:1))||(P(u,"staticvenom")&&mv.pow&&Math.random()<u.pv*(t.boss?.5:1))){t.stun=true;note+=` ${uname(t)} is stunned.`}
    if(mv.dot){if(mv.el==="fire")applySt(t,"burn",u,1);else{t.dot=3;t.dotDmg=.35*eff(u,"atk")}}
    if(mv.tAtk)t.mod.atk=[mv.tAtk,4];if(mv.tDef)t.mod.def=[mv.tDef,4];if(mv.tSpd)t.mod.spd=[mv.tSpd,4];}
  }
  if(t.hp>0&&mv.stc&&!mv.els&&EL_ST[mv.el]&&Math.random()<mv.stc)applySt(t,EL_ST[mv.el],u);
  const sanct=realmsOf(u.m).includes("sanctum"),mates=sanct?(u.side==="you"?F.team:F.foes).filter(x=>x!==u&&x.hp>0&&!x.isEgg):[];
  if(mv.heal){const h=heal(u,u.max*mv.heal*(sanct?SANCT_HEAL:1));if(h)floatOn(u,"+"+fmt(h),"heal");
    mates.forEach(x=>{const g=heal(x,x.max*mv.heal*.5,1);if(g)floatOn(x,"+"+fmt(g),"heal")})} // Sanctum heals splash half onto teammates
  const bst=v=>sanct?1+(v-1)*SANCT_BOOST:v;
  if(mv.sAtk)u.mod.atk=[bst(mv.sAtk),4];if(mv.sDef)u.mod.def=[bst(mv.sDef),4];if(mv.sSpd)u.mod.spd=[bst(mv.sSpd),4];
  mates.forEach(x=>{if(mv.sAtk&&x.mod.atk[0]<mv.sAtk)x.mod.atk=[mv.sAtk,3];if(mv.sDef&&x.mod.def[0]<mv.sDef)x.mod.def=[mv.sDef,3];if(mv.sSpd&&x.mod.spd[0]<mv.sSpd)x.mod.spd=[mv.sSpd,3]}); // and its boosts reach teammates
  if(mv.shield){u.shield=sanct?2:1;mates.forEach(x=>{x.shield=Math.max(x.shield,1)})}
  if(mv.brace){u.braced=FIELD()==="cloister"?.2:mv.brace;floatOn(u,"Bracing","st")}
  if(mv.cleanse){u.dot=0;u.stun=false;u.st={};for(const k of["atk","def","spd"])if(u.mod[k][0]<1)u.mod[k]=[1,0]}
  say(`${uname(u)} used ${mv.n}.${note}`);
  paintFoeHp(curFoe(),F.foes.length-1-F.fa);renderTeam();paintIcons();if(F.shown)$("myImg").style.opacity=F.shown.hp>0?1:.25;
  await sleep(650);
}
async function endTurn(S){
  F.round=(F.round||0)+1;
  const field=F.boss?[...F.team,curFoe()]:[F.team[F.active],curFoe()];
  for(const u of field){
    if(u.hp<=0)continue;
    if(u.dot>0){const d=Math.max(1,Math.round(u.dotDmg));u.hp-=d;u.dot--;floatOn(u,"-"+fmt(d),"hurt")}
    if(u.st&&u.st.burn>0&&u.hp>0){const d=Math.max(1,Math.round(u.burnDmg||1));u.hp-=d;floatOn(u,"-"+fmt(d),"hurt")}
    if(u.st)for(const k in u.st){if(--u.st[k]<=0)delete u.st[k]}
    if(u.hp>0&&(P(u,"tidal")||P(u,"deeproots")||P(u,"grace")||P(u,"livingworld"))){const h=Math.round(u.max*(P(u,"livingworld")?.05:u.pv));if(u.hp<u.max){const g=heal(u,h,1);if(g)floatOn(u,"+"+fmt(g),"heal")}}
    {const r=aura(u.side,"auraRegen");if(r&&u.hp>0&&u.hp<u.max){const g=heal(u,u.max*r,1);if(g)floatOn(u,"+"+fmt(g),"heal")}}
    {const e=aura(u.side==="you"?"foe":"you","eclipseaura");if(e&&u.hp>0&&!u.isEgg){const d=Math.max(1,Math.round(u.max*e));u.hp-=d;floatOn(u,"-"+fmt(d),"hurt")}}
    if(aura(u.side,"purify")){u.dot=0;u.st={}}
    if(P(u,"grace")||aura(u.side,"auraGrace")){u.dot=0;u.stun=false;u.st={};for(const k of["atk","def","spd"])if(u.mod[k][0]<1)u.mod[k]=[1,0]}
    if(P(u,"overcharge"))u.over=Math.min(.5,u.over+u.pv);
    for(const k of["atk","def","spd"])if(u.mod[k][1]>0&&--u.mod[k][1]===0)u.mod[k][0]=1;
    if(MU(u,"regen")&&u.hp>0&&u.hp<u.max){const g=heal(u,u.max*.05,1);if(g)floatOn(u,"+"+fmt(g),"heal")}
    if(FIELD()==="root"&&u.hp>0&&u.hp<u.max){const g=heal(u,u.max*.04,1);if(g)floatOn(u,"+"+fmt(g),"heal")}
  }
  if(FIELD()==="storm"){const live=field.filter(u=>u.hp>0);if(live.length){const u=live[Math.floor(Math.random()*live.length)],d=Math.max(1,Math.round(u.max*.05));
    if(!window.__fast)vStrike(u);u.hp-=d;floatOn(u,"-"+fmt(d),"hurt");hitFx(u);if(u.hp>0&&Math.random()<.25&&!resists(u))applySt(u,"shock",u,1);say("Lightning strikes "+uname(u)+".");await sleep(500)}}
  for(const u of[...F.team,...F.foes]){u.braced=0;for(const k in u.cds)if(u.cds[k]>0)u.cds[k]--}
  const foe=curFoe();barCheck(foe);
  if(foe.hp<=0){
    if(!foe.isEgg)defeats[foe.id]=(defeats[foe.id]||0)+1;
    if(F.fa>=F.foes.length-1){F.busy=false;return endFight(true)}
    if(foe.isEgg){
      // the shell bursts and the boss comes out
      if(!window.__fast){if(!muted&&audio()){tone("sine",180,60,.6,.16);noise(.5,.14,1200)}shake(app,10,500);
        for(let f=6;f<=14;f++){setFrame($("bossEgg"),foe.egg,f);await sleep(70);if(F!==S||S.fled)return}}
      F.fa++;showFoe();enter(curFoe());
      if(!window.__fast)$("foeImg").animate([{opacity:0,transform:`scale(${.6*flipOf(curFoe())},.6)`},{opacity:1,transform:`scale(${flipOf(curFoe())},1)`}],{duration:500,easing:"ease-out"});
      say(curFoe().m.name+" bursts out of the egg.");
    }else{
    if(!window.__fast)await $("foeImg").animate([{opacity:1},{opacity:0,filter:"brightness(3) blur(6px)"}],{duration:450}).finished.catch(()=>{});
    if(F!==S||S.fled)return;
    F.fa++;showFoe();say(uname(curFoe())+" steps in.");enter(curFoe());}
  }
  if(!F.team.some(c=>c.hp>0)){F.busy=false;return endFight(false)}
  if(F.raid&&F.round>=RAID_ROUNDS){F.busy=false;return endFight(false)}
  if(!F.boss&&F.team[F.active].hp<=0){F.active=F.team.findIndex(c=>c.hp>0);say(F.team[F.active].m.name+" steps in.");enter(F.team[F.active])}
  if(F.boss)F.ch=F.team.findIndex(c=>c.hp>0);
  F.busy=false;paintFight();
}
function endFight(won){
  F.over=true;F.won=!!won;paintFight();$("resAgain").hidden=false;$("resBack").textContent="Regions";
  if(F.rush)return rushEnd(won);
  if(F.raid)return raidEnd(won);
  const box=$("fightResult");box.hidden=false;
  if(won){
    const evoNote=[];F.team.forEach(c=>{evo[c.id]=(evo[c.id]||0)+1;const nx=MONSTERS.find(x=>x.evolvesFrom===c.id);
      if(branchesOf(c.id).length){const t=evoEl[c.id]=evoEl[c.id]||{};F.foes.forEach(f=>{if(!f.isEgg&&ELN[f.el]&&NAT.concat(["light","shadow"]).includes(f.el))t[f.el]=(t[f.el]||0)+1});
        const pk=branchPick(c.id);if(pk)evoNote.push(evo[c.id]>=BRANCH_WINS?`<p><em>${c.m.name} is taking a face!</em></p>`:`<p><small>${c.m.name}: ${evo[c.id]} / ${BRANCH_WINS} wins · leaning ${ELN[pk.branch]}</small></p>`);return}
      if(nx&&!roster[nx.id])evoNote.push(evo[c.id]>=EVOLVE_WINS?`<p><em>${c.m.name} is evolving!</em></p>`:`<p><small>${c.m.name}: ${evo[c.id]} / ${EVOLVE_WINS} wins toward evolving</small></p>`)});
    const R=regions[F.rid],xp=winXP(F.rid,F.lv,F.boss);let extra="";
    if(F.boss){R.lv++;R.kills=0;if(R.pick)R.pick=R.lv;extra=`<p>Enemies in ${REGION[F.rid].name} are now ★ ${R.lv}.</p>`}else if(F.lv>=R.lv)R.kills=Math.min(killsNeed(R.lv),R.kills+F.foes.length);else extra=`<p><small>Replay of level ${F.lv}: arena progress only counts at level ${R.lv}.</small></p>`;
    // normal enemies each drop a copy of themselves (if you own that creature); a boss drops its realm's wildcard and has a 25% chance of its own copy
    const give=id=>{roster[id].dupes++;roster[id].caught=(roster[id].caught||0)+1};
    if(F.boss){const rl=REGION[F.rid].realm;wild[rl]=(wild[rl]||0)+1;tip("wild");if(Math.random()<CLUTCH_DROP){clutch[rl]=(clutch[rl]||0)+1;extra+=`<p><em>A ${EGGS.find(e=>e.id===rl).name} Clutch dropped!</em> Hold that egg to hatch 10 with better odds.</p>`}extra+=`<p>${REALMN[rl]} Wildcard gained.</p>`;
      const b=curFoe();if(roster[b.id]&&Math.random()<BOSS_COPY){give(b.id);extra+=`<p>${b.m.name} dropped a copy of itself.</p>`}}
    else{const got=F.foes.filter(f=>roster[f.id]);got.forEach(f=>give(f.id));if(got.length)extra+=`<p>Copies gained: ${got.map(f=>f.m.name).join(", ")}</p>`}
    if(evoNote.length)tip("evolve");extra+=evoNote.join("");saveBattle();saveProg();addXP(xp);
    $("resTitle").textContent=F.boss?"Boss defeated":"Victory";
    $("resBody").innerHTML=`<p>${F.boss?curFoe().m.name+" defeated":"Enemy team defeated"} · +${fmt(xp)} XP</p>${extra}${!F.boss&&F.lv>=R.lv&&R.kills>=killsNeed(R.lv)?"<p><em>The boss is ready.</em></p>":""}`;
    if(!muted&&audio())[523,659,784,1047].forEach((n,i)=>tone("sine",n,n,.5,.05,i*.07));
    if(!window.__fast)$("foeImg").animate([{opacity:1,filter:"brightness(1)"},{opacity:0,filter:"brightness(3) blur(6px)"}],{duration:700,fill:"forwards"});
  }else{
    saveBattle();
    $("resTitle").textContent="Defeat";$("resBody").innerHTML=`<p>Your team was knocked out.</p><p>Raise your creatures' stars, or bring moves that are strong against this realm.</p>`;
  }
  $("resAgain").textContent=won&&F.boss?"Next fight":"Fight again";
}
{
  $("autoBtn").onclick=()=>{AUTO=!AUTO;saveAuto();paintAuto();autoTick()};
  $("spdBtn").onclick=()=>{SPD=SPD>1?1:2;saveAuto();paintAuto()};paintAuto();
  $("flee").onclick=()=>{if(F&&F.rush&&RUSH&&!RUSH.done)return rushLeave();if(F&&F.raid&&!F.over){F.busy=false;return endFight(false)}if(F){F.over=true;F.fled=true}view("regions")};
  $("resAgain").onclick=()=>{if(F&&F.rush)return rushNext();if(F&&F.raid)return raidFight(F.raid);const R=regions[F.rid];startFight(F.rid,F.lv>=R.lv&&R.kills>=killsNeed(R.lv)&&!(R.pick&&R.pick<R.lv),true)};
  $("resBack").onclick=()=>{if(F&&F.rush&&RUSH&&!RUSH.done)return rushLeave();view("regions")};
  $("openBattle").onclick=()=>view("regions");$("regionsBack").onclick=home;
}
