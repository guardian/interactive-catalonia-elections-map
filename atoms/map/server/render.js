import mainHTML from "./atoms/map/server/templates/main.html!text"
import fs from "fs";
import csvParse from "csv-parse/lib/es5/sync";
import csvStringify from 'csv-stringify/lib/es5/sync'


const files = [
'./shared/data/TXMUNAU09089.csv',
'./shared/data/TXMUNAU09179.csv',
'./shared/data/TXMUNAU09259.csv',
'./shared/data/TXMUNAU09439.csv'
]

let data = []

for (const file of files) {



	let provinceRaw = fs.readFileSync(file,"utf8");
	const province = csvParse(provinceRaw,{"delimiter": ";","rtrim": true});


	province.map(field => {

		if(field[5] === '99')
		{
			let municipality = []

			municipality.push({

				code:'34' + field[1] + field[2] + field[2] + field[4],
				name:field[6],
				census_total:+field[10],
				census_counted:+field[11],
				census_counted_percentage:+field[12] / 100,
				voters:+field[13],
				voters_percentage:+field[14]/100,
				abstention:+field[15],
				abstention_percentage:+field[16]/100,
				blank_votes:+field[17],
				blank_votes_percentage:+field[18]/100,
				null_votes:+field[19],
				null_votes_percentage:+field[20]/100,
				results:[]

			})

			for(let i = 0; i < 300; i++)
			{

				if(i%4 == 0){

					if(+field[23 +i] > 0)
					{
						municipality[0].results.push({
							party_code:field[21 +i],
							party_name:field[22 +i],
							votes:+field[23 +i],
							percentage:+field[24 +i] /100
						})
					}

					
				}
				
			}

			data.push(municipality[0])
		}
	})

	fs.writeFileSync('assets/results.json', JSON.stringify(data));

}



export async function render() {
    return mainHTML;
} 