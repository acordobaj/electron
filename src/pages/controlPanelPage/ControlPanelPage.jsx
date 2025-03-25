import React, { useContext } from "react";
import { ThemeContext } from "../../Store/Context";
import ButtonDeploy from "../../components/buttons/Button_deploy";
import RegisterUserForm from "../../components/forms/RegisterUserForm";
import ModificarUsuario from "../../components/forms/ModifyUserForm";
import EliminarUsuario from "../../components/forms/DeleteUserForm";
export default function ControlPanelPage() {
  const { formularioActivo } = useContext(ThemeContext);

  return (
    <>
      <section className="m-2">
        <ButtonDeploy title="Crear usuario"/>
        <ButtonDeploy title="Modificar usuario"  />
        <ButtonDeploy title="Eliminar usuario"  />
      </section>

      {formularioActivo === "Crear usuario" && <RegisterUserForm />}
      {formularioActivo === "Modificar usuario" && <ModificarUsuario />}
      {formularioActivo === "Eliminar usuario" && <EliminarUsuario />}
    </>
  );
}
