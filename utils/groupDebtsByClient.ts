const groupDebtsByClient = (debts) => {
  return Object.values(debts.reduce((acc, debt) => {
    if (!acc[debt.phoneNumber]) {
      acc[debt.phoneNumber] = {
        id: debt.phoneNumber,
        client: debt.name,
        phoneNumber: debt.phoneNumber,
        totalDebt: 0,
        debts: []
      }
    }
    
    acc[debt.phoneNumber].totalDebt += debt.balance
    acc[debt.phoneNumber].debts.push({
      amount: debt.balance,
      dueDate: debt.dueDate
    })
    
    return acc
  }, {}))
}

export default groupDebtsByClient