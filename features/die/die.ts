import { signinOrRefresh } from '../login/login';
import { MyOrganizationDieOrders } from '../../generated/MyOrganizationDieOrders';
import { CostStudy, DieOrderFilter, DieOrderModel, QuantifiedCostStudyDto } from '../../generated/data-contracts';
import { CostStudy as CostStudyApi } from '../../generated/CostStudy';
import { Report } from '../../generated/Report';

const fetchDieOrders = async (dieOrderFilter: DieOrderFilter) => {
  const user = await signinOrRefresh();
  const accessToken = user?.access_token;
  const myOrganizationDieOrdersApi = new MyOrganizationDieOrders();
  const response = await myOrganizationDieOrdersApi.searchMyOrganizationDieOrders(
    dieOrderFilter,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return response.data;
  // could be if not using auto-generated client
  // const response = await fetch('${apiUrl}/me/organization/die-orders/search', {
  //   method: 'POST',
  //   body: JSON.stringify(
  //     dieOrderFilter
  //   ),
  //   headers: {
  //     'Authorization': `Bearer ${accessToken}`,
  //     'Content-Type': 'application/json',
  //   },
  // });
  // return response?.json();
}

const getCostStudy = async (dieOrderId: string) => {
  const user = await signinOrRefresh();
  const accessToken = user?.access_token;
  const costStudyApi = new CostStudyApi();
  const response = await costStudyApi.getCostStudyByDieOrder(dieOrderId, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
  // could be if not using auto-generated client
  // const response = await fetch(`${apiUrl}/me/organization/die-orders/${dieOrderId}/cost-study`, {
  //   method: 'GET',
  //   headers: {
  //     'Authorization': `Bearer ${accessToken}`,
  //     'Content-Type': 'application/json',
  //   },
  // });
  // return response?.json();
}

const generateReport = async (dieId: string, quantifiedCostStudy: QuantifiedCostStudyDto) => {
  const user = await signinOrRefresh();
  const accessToken = user?.access_token;
  const reportApi = new Report();
  const response = await reportApi.generateReport(
    dieId,
    quantifiedCostStudy,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return response.data;
  // could be if not using auto-generated client
  // const response = await fetch(`${apiUrl}/dies/${dieId}/report`, {
  //   method: 'POST',
  //   body: JSON.stringify(quantifiedCostStudy),
  //   headers: {
  //     'Authorization': `Bearer ${accessToken}`,
  //     'Content-Type': 'application/json',
  //   },
  // });
  // return response?.json();
}

const transformCostStudyToQuantifiedCostStudyDto = (costStudy: CostStudy): QuantifiedCostStudyDto => {
  // Dummy transformation for the sake of example
  return {
    ...costStudy,
    lines: costStudy.lines.map(line => ({
      ...line,
      cells: line.cells.map(cell => ({
        ...cell,
        costStudyCellId: cell.id,
        numericContent: 
           cell.columnType === 'QUANTITY' || cell.columnType === 'PRICE_PER_UNIT' 
             ? Math.ceil(Math.random() * 100) : cell.numericContent,
      })),
    })),
  };
}

const ordersContainer = document.getElementById('orders-container');
if (ordersContainer) {
  const orders = await fetchDieOrders({});
  const dieOrdersWithCostStudies: {dieOrder: DieOrderModel; costStudy?: CostStudy;}[] = orders.content.map(order => ({
    dieOrder: order,
    costStudy: undefined,
  }));
  if (!orders?.content?.length) {
    ordersContainer.textContent = 'No die orders found.';
  } else {
    const ul = document.createElement('ul');
    dieOrdersWithCostStudies.forEach(({dieOrder}, index) => {
      const li = document.createElement('li');
      li.textContent = `Order ID: ${dieOrder.id}, Status: ${dieOrder.status}`;
      // create a button to fetch cost study
      const button = document.createElement('button');
      if (dieOrder.status !== 'FINISHED') {
        button.disabled = true;
      }
      button.textContent = 'Fetch Cost Study';
      button.addEventListener('click', async () => {
        button.remove();
        const costStudy =  await getCostStudy(dieOrder.id);
        dieOrdersWithCostStudies[index].costStudy = costStudy;
        // fill the cost study div
        const costStudyDiv = document.getElementById(`cost-study-${dieOrder.id}`);
        if (costStudyDiv) {
          costStudyDiv.innerHTML = `Cost study: 
          <pre>${JSON.stringify({id: costStudy.id, lines: costStudy.lines.length, productionReport: costStudy.productionReport}, null, 2)}</pre>`;
          // create a generate report button
          const generateReportButton = document.createElement('button');
          // disable button if state is not finished
          console.log(dieOrder.status);
          if (dieOrder.status !== 'FINISHED') {
            console.log('Disabling generate report button for Order ID', dieOrder.id, 'with status', dieOrder.status);
            generateReportButton.disabled = true;
          }
          generateReportButton.textContent = 'Generate Report';
          generateReportButton.addEventListener('click', async () => {
            const report = await generateReport(dieOrder.id, transformCostStudyToQuantifiedCostStudyDto(costStudy));
            console.log('Generated Report for Order ID', dieOrder.id, report);
          });
          costStudyDiv.appendChild(generateReportButton);
        }
      });
      // create a div element to display the cost study
      const costStudyDiv = document.createElement('div');
      costStudyDiv.id = `cost-study-${dieOrder.id}`;
      li.appendChild(costStudyDiv);
      li.appendChild(button);
      ul.appendChild(li);
    });
    ordersContainer.appendChild(ul);
  }
}
