export default function ProfitTable({ profitPerDish }) {
  return (
    <div className="profit-section">
      <h3>Benefice net par plat</h3>
      {profitPerDish.length > 0 ? (
        <div className="table-wrapper">
          <table className="profit-table">
            <thead>
              <tr>
                <th>Plat</th>
                <th>Fois vendu</th>
                <th>Revenu total</th>
                <th>Cout ingredients</th>
                <th>Benefice / plat</th>
                <th>Benefice total</th>
              </tr>
            </thead>
            <tbody>
              {profitPerDish.map((dish, idx) => (
                <tr key={idx}>
                  <td className="dish-name">{dish.recipeName}</td>
                  <td>{dish.timesSold}</td>
                  <td className="revenue">{dish.totalRevenue}G</td>
                  <td className="cost">{dish.ingredientCostPerServe}G</td>
                  <td className={dish.netProfitPerServe >= 0 ? 'profit' : 'loss'}>
                    {dish.netProfitPerServe >= 0 ? '+' : ''}{dish.netProfitPerServe}G
                  </td>
                  <td className={dish.totalNetProfit >= 0 ? 'profit' : 'loss'}>
                    {dish.totalNetProfit >= 0 ? '+' : ''}{dish.totalNetProfit}G
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-data">Aucun plat vendu pour le moment. Demarrez le service pour commencer a vendre !</p>
      )}
    </div>
  );
}
