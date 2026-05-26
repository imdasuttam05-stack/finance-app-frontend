
import { useState } from "react";
import axios from "axios";

export default function TransactionForm({
  persons,
  transactions,
  expenseCategories,
  investmentTypes,
}) {

const [saving,setSaving]=useState(false);

const [form,setForm]=useState({

type:"",
person:"",
subType:"",
category:"",
subCategory:"",
amount:"",
note:"",
linkedLoan:""

});

const submit=async()=>{

try{

setSaving(true);

const payload={

...form,
amount:Number(form.amount)

};

if(form.linkedLoan){

payload.againstEntry=
form.linkedLoan;

}

await axios.post(
"/api/transactions",
payload
);

setForm({

type:"",
person:"",
subType:"",
category:"",
subCategory:"",
amount:"",
note:"",
linkedLoan:""

});

}
catch(err){

console.log(err);

}
finally{

setSaving(false);

}

};

return (

<div className="card">

<div className="grid">

{/* Transaction Type */}

<div
className="field"
style={{gridColumn:"span 4"}}
>

<div className="label">
Transaction Type
</div>

<select
className="select"
value={form.type}
onChange={(e)=>
setForm({
...form,
type:e.target.value
})
}
>

<option value="">
Select
</option>

<option value="income">
Income
</option>

<option value="expense">
Expense
</option>

<option value="loan">
Loan
</option>

<option value="investment">
Investment
</option>

</select>

</div>

{/* EXPENSE */}

{form.type==="expense" && (

<>

<div
className="field"
style={{gridColumn:"span 4"}}
>

<div className="label">
Category
</div>

<select
className="select"
value={form.category}
onChange={(e)=>
setForm({
...form,
category:e.target.value,
subCategory:""
})
}
>

<option value="">
Select
</option>

{Object.keys(
expenseCategories
).map((cat)=>(

<option
key={cat}
value={cat}
>

{cat}

</option>

))}

</select>

</div>

<div
className="field"
style={{gridColumn:"span 4"}}
>

<div className="label">
Sub Category
</div>

<select
className="select"
disabled={!form.category}
value={form.subCategory}
onChange={(e)=>
setForm({
...form,
subCategory:e.target.value
})
}
>

<option value="">
Select
</option>

{expenseCategories[
form.category
]?.map((sub)=>(

<option
key={sub}
value={sub}
>

{sub}

</option>

))}

</select>

</div>

</>

)}

{/* LOAN */}

{form.type==="loan" && (

<>

<div
className="field"
style={{gridColumn:"span 4"}}
>

<div className="label">
Ledger
</div>

<select
className="select"
value={form.person}
onChange={(e)=>
setForm({

...form,
person:e.target.value,
linkedLoan:""

})
}
>

<option value="">
Select Ledger
</option>

{persons.map((p)=>(

<option
key={p._id}
value={p._id}
>

{p.name}

</option>

))}

</select>

</div>

<div
className="field"
style={{gridColumn:"span 4"}}
>

<div className="label">
Loan Type
</div>

<select
className="select"
value={form.subType}
onChange={(e)=>
setForm({

...form,
subType:e.target.value

})
}
>

<option value="">
Select
</option>

<option value="asset">
Given
</option>

<option value="liability">
Received
</option>

</select>

</div>

{form.person && (

<div
className="field"
style={{gridColumn:"span 8"}}
>

<div className="label">
Against Previous Loan
</div>

<select
className="select"
value={form.linkedLoan}
onChange={(e)=>
setForm({

...form,
linkedLoan:e.target.value

})
}
>

<option value="">
Select Loan
</option>

{transactions
.filter(
(t)=>

t.type==="loan" &&
t.person===form.person
)
.map((t)=>(

<option
key={t._id}
value={t._id}
>

₹{t.amount}
{" | "}
{t.subType}
{" | "}
Balance:
₹{
t.remainingAmount ||
t.amount
}

</option>

))}

</select>

</div>

)}

{form.linkedLoan && (

<div
className="field"
style={{gridColumn:"span 8"}}
>

<div className="label">
Remaining Balance
</div>

<input
className="input"
disabled
value={
transactions.find(
(x)=>
x._id===
form.linkedLoan
)?.remainingAmount || 0
}
/>

</div>

)}

</>

)}

{/* Investment */}

{form.type==="investment" && (

<div
className="field"
style={{gridColumn:"span 4"}}
>

<div className="label">
Investment Type
</div>

<select
className="select"
value={form.subType}
onChange={(e)=>
setForm({

...form,
subType:e.target.value

})
}
>

<option value="">
Select
</option>

{investmentTypes.map(
(inv)=>(

<option
key={inv}
value={inv}
>

{inv}

</option>

))
}

</select>

</div>

)}

{/* Amount */}

<div
className="field"
style={{gridColumn:"span 4"}}
>

<div className="label">
Amount
</div>

<input
className="input"
type="number"
value={form.amount}
onChange={(e)=>
setForm({

...form,
amount:e.target.value

})
}
/>

</div>

</div>

{/* Note */}

<div className="field">

<div className="label">
Note
</div>

<textarea
className="textarea"
value={form.note}
onChange={(e)=>
setForm({

...form,
note:e.target.value

})
}
/>

</div>

<button
className="btn"
onClick={submit}
disabled={saving}
>

{saving
? "Saving..."
: "Save Transaction"}

</button>

</div>

);

}
