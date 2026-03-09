import { Button as PButton } from "primereact";
import { confirmPopup, ConfirmPopup } from 'primereact/confirmpopup';
import { memo } from "react";

import { useDispatch } from "react-redux";

const ButtonComponent = (props) => {
  const dispatch = useDispatch()

  const confirm = (event) => {
    const myConfirm = confirmPopup({
      target: event.currentTarget,
      message: 'Are you sure you want to proceed?',
      icon: 'pi pi-exclamation-triangle',
    });
    myConfirm.show();
    // setTimeout(() => {
    //     myConfirm.hide();

    //     setTimeout(() => {

    //     }, 1000);
    // }, 500);
  }
  const onClick = (e) => {
    if (typeof props.onClick != 'function') return
    if (props.confirmMessage) {
      let options = {
        target: e.currentTarget,
        message: props.confirmMessage,
        icon: 'pi pi-exclamation-triangle',
        acceptClassName: "p-button-success",
        accept: props.onClick,
        acceptLabel: "Oui",
        rejectLabel: "Non"
      }

      const dl = confirmPopup(options)
      setTimeout(() => {
        dl.show();
      }, 1000);
    } else
      props.onClick(e)
  }
  return (
    <div className="inline-block">
      <PButton  {...props} onClick={onClick} >{props.children}</PButton>
      <ConfirmPopup />
    </div>
  )
}


export default memo(ButtonComponent)