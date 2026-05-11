import React from 'react';
import PropTypes from 'prop-types';
import CreateAssetCard from './CreateAssetCard';
import OrderListItem from './OrderListItem';

function OrderListContent({ vw }) {
  const myOrders = [
    {
      id: 1,
      title: '냥냥',
      date: '2026-02-10',
      status: 'PENDING',
      img: 'https://via.placeholder.com/100',
    },
    {
      id: 2,
      title: '캐릭터 모델링',
      date: '2026-02-08',
      status: 'QUOTED',
      img: 'https://via.placeholder.com/100',
    },
  ];

  return (
    <div>
      <CreateAssetCard vw={vw} />
      <div style={S.listWrapper(vw)}>
        {myOrders.map((order) => (
          <OrderListItem key={order.id} item={order} vw={vw} />
        ))}
      </div>
    </div>
  );
}

OrderListContent.propTypes = {
  vw: PropTypes.func.isRequired,
};

const S = {
  listWrapper: (vw) => ({
    marginTop: vw(80),
    display: 'flex',
    flexDirection: 'column',
    gap: vw(15),
  }),
};

export default OrderListContent;
