import { randomElement } from './utils'
/**
 * Gfycat-like human-friendly ID generator
 * @returns {string} ID
 */
export function makeID() {
	const words = 'aero,alabaster,alizarin,almond,amaranth,amazon,amber,amethyst,ao,apricot,aqua,aquamarine,artichoke,asparagus,auburn,aureolin,avocado,azure,beaver,beige,bisque,bistre,bittersweet,black,blue,blueberry,blush,bole,bone,bronze,brown,buff,burgundy,burlywood,byzantine,byzantium,cadet,calypso,camel,cardinal,carmine,carnelian,catawba,celadon,celeste,cerise,cerulean,champagne,charcoal,chartreuse,chestnut,chocolate,cinereous,citrine,citron,claret,coconut,coffee,copper,coquelicot,coral,cordovan,cornsilk,cream,crimson,cultured,cyan,cyclamen,dandelion,denim,desert,diamond,dirt,ebony,ecru,eggplant,eggshell,emerald,eminence,eucalyptus,fallow,fandango,fawn,feldgrau,firebrick,flame,flax,flirt,frostbite,fuchsia,fulvous,gainsboro,gamboge,garnet,glaucous,gold,goldenrod,gray,green,grullo,gunmetal,harlequin,heliotrope,honeydew,iceberg,icterine,inchworm,independence,indigo,iris,irresistible,isabelline,ivory,jade,jasmine,jet,jonquil,keppel,khaki,kobe,kobi,kobicha,lanzones,lava,lavender,lemon,lenurple,liberty,licorice,lilac,lime,limerick,linen,lion,liver,livid,lotion,lumber,lust,magenta,mahogany,maize,malachite,manatee,mandarin,mango,mantis,marigold,maroon,mauve,mauvelous,melon,menthol,midnight,milk,mindaro,ming,mint,moccasin,mocha,moonstone,mud,mulberry,mustard,mystic,nickel,nyanza,ochre,olive,olivine,onyx,opal,orange,orchid,oxblood,oxley,parchment,patriarch,peach,pear,pearl,peridot,periwinkle,persimmon,peru,petal,phlox,pineapple,pink,pistachio,platinum,plum,popstar,prune,puce,pumpkin,purple,purpureus,quartz,quincy,rackley,rajah,raspberry,razzmatazz,red,redwood,rhythm,rose,rosewood,ruber,ruby,rufous,rum,russet,rust,saffron,sage,salem,salmon,sand,sandstorm,sapphire,scarlet,seashell,sepia,shadow,shampoo,shandy,sienna,silver,sinopia,skobeloff,smalt,smitten,smoke,snow,soap,straw,strawberry,sunglow,sunny,sunray,sunset,taffy,tan,tangelo,tangerine,taupe,teal,telemagenta,temptress,tenne,thistle,timberwolf,titanium,tomato,toolbox,tooth,topaz,tulip,tumbleweed,turquoise,tuscan,tuscany,ube,ultramarine,umber,urobilin,vanilla,verdigris,vermilion,veronica,violet,viridian,water,watermelon,waterspout,wenge,wheat,white,wine,wisteria,xanadu,yellow,zaffre,zinnwaldite,zomp'.split(',')

	return new Array(3).fill(words).map(randomElement).join('-')
}
